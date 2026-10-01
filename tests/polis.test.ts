import { expect, test, vi } from "vite-plus/test";

// The real loader verifies and derives the checked-in Polis snapshot.
// `src/lib/polis.ts` only awaits and forwards that result, so this focused
// bridge test mocks the derivation; `polis-snapshot.test.ts` covers the real
// offline loader.
vi.mock("../_data/polis_care_deliberation.js", () => ({
    default: async () => ({ ok: true, mocked: true }),
}));

import { getPolisCareDeliberation, polisCareUi } from "../src/lib/polis";

test("re-exports the Polis care UI copy for both languages", () => {
    expect(polisCareUi).toHaveProperty("en");
    expect(polisCareUi).toHaveProperty("tw");
});

test("awaits and forwards the Polis care deliberation loader's result", async () => {
    await expect(getPolisCareDeliberation()).resolves.toEqual({
        ok: true,
        mocked: true,
    });
});
