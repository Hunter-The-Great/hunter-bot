import { afterEach, describe, expect, test } from "bun:test";
import { backup, embedify } from "./embedify";

const originalFetch = globalThis.fetch;
const instagramLink =
  "https://www.instagram.com/reel/DbOg3J2P6Oq/?igsh=dWM1emVzZjUxbWJq";
const fallbackLink =
  "https://oginstagram.com/reel/DbOg3J2P6Oq/?igsh=dWM1emVzZjUxbWJq";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("backup", () => {
  test("uses the working Instagram embed provider", () => {
    expect(backup(instagramLink)).toBe(fallbackLink);
  });

  test("only rewrites Instagram hostnames", () => {
    const link = "https://notinstagram.com/reel/DbOg3J2P6Oq/";
    expect(backup(link)).toBe(link);
  });

  test("keeps the TikTok fallback", () => {
    expect(backup("https://www.tiktok.com/@user/video/123")).toBe(
      "https://tnktok.com/@user/video/123"
    );
  });
});

describe("embedify", () => {
  test("returns Cobalt media responses", async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: "tunnel",
          url: "https://cobalt.example/video",
          filename: "video.mp4",
        })
      );

    await expect(embedify(instagramLink)).resolves.toEqual({
      url: "https://cobalt.example/video",
      filename: "video.mp4",
    });
  });

  test("falls back when Cobalt returns an error body", async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ status: "error", error: { code: "error.api" } })
      );

    await expect(embedify(instagramLink)).resolves.toEqual({
      url: fallbackLink,
      filename: null,
    });
  });

  test("falls back when Cobalt is unavailable", async () => {
    globalThis.fetch = async () => {
      throw new Error("network error");
    };

    await expect(embedify(instagramLink)).resolves.toEqual({
      url: fallbackLink,
      filename: null,
    });
  });

  test("rejects invalid fallback links", async () => {
    globalThis.fetch = async () => new Response(null, { status: 500 });

    await expect(embedify("not a link")).resolves.toBeNull();
  });
});
