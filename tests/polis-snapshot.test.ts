import { expect, test, vi } from "vite-plus/test";

import loadPolisCareDeliberation from "../_data/polis_care_deliberation.js";

test("derives the checked-in Polis snapshot deterministically and offline", async () => {
    const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockRejectedValue(new Error("network access is forbidden"));

    const first = await loadPolisCareDeliberation();
    const second = await loadPolisCareDeliberation();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(first).toMatchObject({
        ok: true,
        snapshotId:
            "39b1eed77ad2caed03c11d38b7f5730b5008f9df14e4c7617dc3b2854b740db0",
        stats: {
            participants: 62,
            votes: 671,
            statements: 20,
            clusters: 3,
            clusteredParticipants: 45,
        },
    });
    expect(
        first.groups.map(
            ({
                displayCode,
                count,
            }: {
                displayCode: string;
                count: number;
            }) => [displayCode, count]
        )
    ).toEqual([
        ["A", 17],
        ["B", 21],
        ["C", 7],
        ["U", 17],
    ]);

    fetchSpy.mockRestore();
});
