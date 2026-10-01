// Rasterise outline paths (librsvg via sharp) and align them to target ink.
import sharp from "sharp";

export async function renderMask(d, box, threshold = 128) {
    const [x0, y0, x1, y1] = box;
    const w = x1 - x0,
        h = y1 - y0;
    if (!d) return new Uint8Array(w * h);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x0} ${y0} ${w} ${h}"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
    const { data } = await sharp(Buffer.from(svg), {
        limitInputPixels: false,
        unlimited: true,
    })
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const m = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) m[i] = data[i] < threshold ? 1 : 0;
    return m;
}

function score(a, b, w, h, dx, dy, step = 1) {
    let inter = 0,
        uni = 0;
    for (let y = 0; y < h; y += step) {
        const ys = y - dy;
        const inY = ys >= 0 && ys < h;
        for (let x = 0; x < w; x += step) {
            const xs = x - dx;
            const av = inY && xs >= 0 && xs < w ? a[ys * w + xs] : 0;
            const bv = b[y * w + x];
            inter += av & bv;
            uni += av | bv;
        }
    }
    return uni ? inter / uni : 1;
}

// Integer shift (dx, dy) moving `a` onto `b` that maximises IoU.
export function bestShift(a, b, w, h, rx = 16, ry = rx) {
    let best = { dx: 0, dy: 0, iou: score(a, b, w, h, 0, 0) };
    // coarse pass on every other pixel, 2 px steps
    if (rx > 3 || ry > 3) {
        for (let dy = -ry; dy <= ry; dy += 2)
            for (let dx = -rx; dx <= rx; dx += 2) {
                const v = score(a, b, w, h, dx, dy, 2);
                if (v > best.iou + 1e-9) best = { dx, dy, iou: v };
            }
        best.iou = score(a, b, w, h, best.dx, best.dy);
    }
    const c = { ...best };
    for (let dy = c.dy - 2; dy <= c.dy + 2; dy++)
        for (let dx = c.dx - 2; dx <= c.dx + 2; dx++) {
            if (Math.abs(dx) > rx + 1 || Math.abs(dy) > ry + 1) continue;
            const v = score(a, b, w, h, dx, dy);
            if (v > best.iou + 1e-9) best = { dx, dy, iou: v };
        }
    return best;
}

// Ink present in one mask but farther than r px from any ink in the other.
export function mismatch(a, b, w, h, r = 3) {
    let missed = 0,
        extra = 0,
        na = 0,
        nb = 0;
    const near = (m, x, y) => {
        for (let yy = Math.max(0, y - r); yy <= Math.min(h - 1, y + r); yy++)
            for (
                let xx = Math.max(0, x - r);
                xx <= Math.min(w - 1, x + r);
                xx++
            )
                if (m[yy * w + xx]) return true;
        return false;
    };
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (a[i]) {
                na++;
                if (!b[i] && !near(b, x, y)) extra++;
            }
            if (b[i]) {
                nb++;
                if (!a[i] && !near(a, x, y)) missed++;
            }
        }
    return { extra: na ? extra / na : 0, missed: nb ? missed / nb : 0 };
}
