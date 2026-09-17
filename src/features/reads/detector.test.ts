import { describe, expect, it, vi } from "vitest";
import { createReadDetector } from "./detector";

function setup(marker: string | null = null, accepted = true) {
  const storage = { getItem: vi.fn(() => marker), setItem: vi.fn() };
  const send = vi.fn(async () => accepted);
  const detect = createReadDetector({ siteId: "site", articleId: "a", windowMs: 60000, now: () => 100000, storage, send });
  return { detect, send, storage };
}
describe("qualified read session", () => {
  it("does not send on opening or below both thresholds", async () => {
    const { detect, send } = setup();
    await detect(0, 0); await detect(9999, 0.249);
    expect(send).not.toHaveBeenCalled();
  });
  it.each([[10000, 0], [0, 0.25]])("qualifies at %i ms / %f exactly once under concurrent triggers", async (time, scroll) => {
    const { detect, send, storage } = setup();
    await Promise.all([detect(time, scroll), detect(10000, 1), detect(20000, 1)]);
    expect(send).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith("read:site:a", "100000");
  });
  it("suppresses refresh inside window and accepts at window boundary", async () => {
    const fresh = setup("40001"); await fresh.detect(10000, 0); expect(fresh.send).not.toHaveBeenCalled();
    const expired = setup("40000"); await expired.detect(10000, 0); expect(expired.send).toHaveBeenCalledTimes(1);
  });
  it("does not store failed requests or retry", async () => {
    const { detect, send, storage } = setup(null, false);
    await detect(10000, 0); await detect(20000, 1);
    expect(storage.setItem).not.toHaveBeenCalled(); expect(send).toHaveBeenCalledTimes(1);
  });
  it("survives unavailable storage and network", async () => {
    const { detect, storage, send } = setup();
    storage.getItem.mockImplementation(() => { throw new Error("blocked"); });
    send.mockRejectedValue(new Error("offline"));
    await expect(detect(10000, 0)).resolves.toBeUndefined();
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
