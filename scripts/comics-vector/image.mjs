// Raster plumbing: RGB buffers, ink masks, connected components, dilation.
import sharp from "sharp";

export async function loadRGB(path, size) {
    let img = sharp(path, { limitInputPixels: false }).removeAlpha();
    if (size)
        img = img.resize(size.w, size.h, { fit: "fill", kernel: "lanczos3" });
    const { data, info } = await img
        .raw()
        .toBuffer({ resolveWithObject: true });
    return { w: info.width, h: info.height, data };
}

export function rgbImage(rgb) {
    return sharp(rgb.data, {
        raw: { width: rgb.w, height: rgb.h, channels: 3 },
        limitInputPixels: false,
    });
}

// Pixels where `a` is darker or differently coloured than `b` by more than thr.
export function diffMask(a, b, thr = 48) {
    const n = a.w * a.h;
    const m = new Uint8Array(n);
    const A = a.data,
        B = b.data;
    for (let i = 0, j = 0; i < n; i++, j += 3) {
        const d = Math.max(
            Math.abs(A[j] - B[j]),
            Math.abs(A[j + 1] - B[j + 1]),
            Math.abs(A[j + 2] - B[j + 2])
        );
        if (d > thr) m[i] = 1;
    }
    return m;
}

// Pixels of `a` with no match in `b` within r px, or of `b` with none in
// `a`: real changes, not the sub-pixel misregistration of two resamplings.
export function changedMask(a, b, thr = 56, r = 2) {
    const { w, h } = a;
    const m = new Uint8Array(w * h);
    const unmatched = (P, Q, x, y) => {
        const j = (y * w + x) * 3;
        for (let dy = -r; dy <= r; dy++) {
            const yy = y + dy;
            if (yy < 0 || yy >= h) continue;
            for (let dx = -r; dx <= r; dx++) {
                const xx = x + dx;
                if (xx < 0 || xx >= w) continue;
                const k = (yy * w + xx) * 3;
                if (
                    Math.abs(P[j] - Q[k]) <= thr &&
                    Math.abs(P[j + 1] - Q[k + 1]) <= thr &&
                    Math.abs(P[j + 2] - Q[k + 2]) <= thr
                )
                    return false;
            }
        }
        return true;
    };
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const j = (y * w + x) * 3;
            const d = Math.max(
                Math.abs(a.data[j] - b.data[j]),
                Math.abs(a.data[j + 1] - b.data[j + 1]),
                Math.abs(a.data[j + 2] - b.data[j + 2])
            );
            if (d <= thr) continue;
            if (
                unmatched(a.data, b.data, x, y) ||
                unmatched(b.data, a.data, x, y)
            )
                m[y * w + x] = 1;
        }
    return m;
}

// 8-connected components; labels[i] is the component id or -1.
export function components(mask, w, h, minArea = 1) {
    const labels = new Int32Array(w * h).fill(-1);
    const parent = [];
    const find = (x) => {
        while (parent[x] !== x) x = parent[x] = parent[parent[x]];
        return x;
    };
    const union = (a, b) => {
        a = find(a);
        b = find(b);
        if (a !== b) parent[Math.max(a, b)] = Math.min(a, b);
    };
    for (let y = 0; y < h; y++) {
        const row = y * w;
        for (let x = 0; x < w; x++) {
            const i = row + x;
            if (!mask[i]) continue;
            let l = x > 0 && mask[i - 1] ? labels[i - 1] : -1;
            if (y > 0)
                for (let dx = -1; dx <= 1; dx++) {
                    const xx = x + dx;
                    if (xx < 0 || xx >= w || !mask[i - w + dx]) continue;
                    const k = labels[i - w + dx];
                    if (l < 0) l = k;
                    else if (k !== l) union(l, k);
                }
            if (l < 0) {
                l = parent.length;
                parent.push(l);
            }
            labels[i] = l;
        }
    }
    const remap = new Int32Array(parent.length).fill(-1);
    const comps = [];
    for (let y = 0; y < h; y++)
        for (let x = 0, i = y * w; x < w; x++, i++) {
            if (labels[i] < 0) continue;
            const r = find(labels[i]);
            let id = remap[r];
            if (id < 0) {
                id = remap[r] = comps.length;
                comps.push({ id, x0: x, y0: y, x1: x, y1: y, area: 0 });
            }
            labels[i] = id;
            const c = comps[id];
            if (x < c.x0) c.x0 = x;
            if (x > c.x1) c.x1 = x;
            if (y > c.y1) c.y1 = y;
            c.area++;
        }
    if (minArea > 1) for (const c of comps) c.small = c.area < minArea;
    return { labels, comps };
}

// Square dilation by r pixels (separable running window).
export function dilate(m, w, h, r) {
    const a = new Uint8Array(w * h),
        b = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
        const row = y * w;
        let last = -1e9;
        for (let x = 0; x < w; x++) {
            if (m[row + x]) last = x;
            if (x - last <= r) a[row + x] = 1;
        }
        last = 1e9;
        for (let x = w - 1; x >= 0; x--) {
            if (m[row + x]) last = x;
            if (last - x <= r) a[row + x] = 1;
        }
    }
    for (let x = 0; x < w; x++) {
        let last = -1e9;
        for (let y = 0; y < h; y++) {
            if (a[y * w + x]) last = y;
            if (y - last <= r) b[y * w + x] = 1;
        }
        last = 1e9;
        for (let y = h - 1; y >= 0; y--) {
            if (a[y * w + x]) last = y;
            if (last - y <= r) b[y * w + x] = 1;
        }
    }
    return b;
}

export function erode(m, w, h, r) {
    const inv = new Uint8Array(w * h);
    for (let i = 0; i < inv.length; i++) inv[i] = m[i] ? 0 : 1;
    const d = dilate(inv, w, h, r);
    for (let i = 0; i < d.length; i++) d[i] = d[i] ? 0 : 1;
    return d;
}

export function cropMask(mask, W, box) {
    const [x0, y0, x1, y1] = box;
    const w = x1 - x0,
        h = y1 - y0;
    const m = new Uint8Array(w * h);
    for (let y = 0; y < h; y++)
        m.set(mask.subarray((y0 + y) * W + x0, (y0 + y) * W + x1), y * w);
    return m;
}

export const clampBox = (b, w, h) => [
    Math.max(0, Math.floor(b[0])),
    Math.max(0, Math.floor(b[1])),
    Math.min(w, Math.ceil(b[2])),
    Math.min(h, Math.ceil(b[3])),
];

// The reference master for a page: the upstream print-resolution PNG, except
// where the site's own image (the canonical copy, which carries later copy
// edits) disagrees with it — there the site image, upscaled, stands in.
export async function buildReference(
    upstreamPath,
    sitePath,
    size,
    boxes = null,
    minCluster = 24,
    wordless = null
) {
    const up = await loadRGB(upstreamPath, size);
    const siteMeta = await sharp(sitePath).metadata();
    const small = { w: siteMeta.width, h: siteMeta.height };
    const site = await loadRGB(sitePath);
    const upSmall = await loadRGB(upstreamPath, small);
    // Changes that survive a 2 px registration tolerance and sit inside a
    // text box are copy edits; elsewhere they are re-export noise in the art.
    const sx0 = small.w / size.w,
        sy0 = small.h / size.h;
    const raw = changedMask(site, upSmall, 56, 2);
    const grown = dilate(raw, small.w, small.h, 6);
    const { labels, comps } = components(grown, small.w, small.h);
    // A re-set line moves every glyph a little, so part of it can still
    // "match" the old one: an edit claims its whole line band, across the
    // text box it sits in.
    const edited = new Uint8Array(small.w * small.h);
    for (const c of comps) {
        let n = 0;
        for (let y = c.y0; y <= c.y1; y++)
            for (let x = c.x0; x <= c.x1; x++)
                if (labels[y * small.w + x] === c.id && raw[y * small.w + x])
                    n++;
        if (n < minCluster) continue;
        const cx = (c.x0 + c.x1) / 2,
            cy = (c.y0 + c.y1) / 2;
        const box = boxes
            ? boxes.find(
                  (b) =>
                      cx >= b[0] * sx0 &&
                      cx <= b[2] * sx0 &&
                      cy >= b[1] * sy0 &&
                      cy <= b[3] * sy0
              )
            : [0, 0, size.w, size.h];
        if (!box) continue;
        const x0 = Math.max(0, Math.floor(box[0] * sx0)),
            x1 = Math.min(small.w, Math.ceil(box[2] * sx0));
        // grow to the line's full height: out to the first blank row (in
        // either image) above and below
        const inked = (y) => {
            for (let x = x0; x < x1; x++) {
                const j = (y * small.w + x) * 3;
                const a = site.data[j] + site.data[j + 1] + site.data[j + 2];
                const b =
                    upSmall.data[j] + upSmall.data[j + 1] + upSmall.data[j + 2];
                if (a < 600 || b < 600) return true;
            }
            return false;
        };
        const top = Math.floor(box[1] * sy0),
            bottom = Math.ceil(box[3] * sy0);
        let y0 = Math.max(0, c.y0, top),
            y1 = Math.min(small.h - 1, c.y1, bottom);
        while (y0 > Math.max(0, top) && inked(y0 - 1)) y0--;
        while (y1 < Math.min(small.h - 1, bottom) && inked(y1 + 1)) y1++;
        y0 = Math.max(0, y0 - 2);
        y1 = Math.min(small.h - 1, y1 + 2);
        for (let y = y0; y <= y1; y++)
            edited.fill(1, y * small.w + x0, y * small.w + x1);
    }
    let editedPx = 0;
    for (const v of edited) editedPx += v;
    if (!editedPx) return { ref: up, edited: null, editedPx };
    const siteBig = await loadRGB(sitePath, size);
    const sx = small.w / size.w,
        sy = small.h / size.h;
    const editedBig = new Uint8Array(size.w * size.h);
    for (let y = 0; y < size.h; y++) {
        const ys = Math.min(small.h - 1, Math.floor(y * sy));
        for (let x = 0; x < size.w; x++) {
            const xs = Math.min(small.w - 1, Math.floor(x * sx));
            if (!edited[ys * small.w + xs]) continue;
            const i = y * size.w + x;
            // within the band, only text changes hands: the master's old ink
            // and the site's new ink (art and paper stay the crisp master)
            if (
                wordless &&
                !isInk(up, wordless, x, y, 0) &&
                !isInk(siteBig, wordless, x, y, 6)
            )
                continue;
            editedBig[i] = 1;
            up.data[i * 3] = siteBig.data[i * 3];
            up.data[i * 3 + 1] = siteBig.data[i * 3 + 1];
            up.data[i * 3 + 2] = siteBig.data[i * 3 + 2];
        }
    }
    return { ref: up, edited: editedBig, editedPx };
}

// Is a's pixel ink over the wordless art: unlike every art pixel within r
// px (r = 0 for registered images, more for an upscaled copy).
function isInk(a, w, x, y, r, thr = 48) {
    const j = (y * a.w + x) * 3;
    for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= a.h) continue;
        for (let dx = -r; dx <= r; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= a.w) continue;
            const k = (yy * a.w + xx) * 3;
            if (
                Math.abs(a.data[j] - w.data[k]) <= thr &&
                Math.abs(a.data[j + 1] - w.data[k + 1]) <= thr &&
                Math.abs(a.data[j + 2] - w.data[k + 2]) <= thr
            )
                return false;
        }
    }
    return true;
}

export function median(values) {
    if (!values.length) return undefined;
    const s = Float64Array.from(values).sort();
    return s[s.length >> 1];
}

export const hex = (rgb) =>
    "#" +
    rgb
        .map((v) => Math.round(v).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
