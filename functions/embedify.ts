type EmbedInfo = {
  url: string;
  filename: string | null;
};

export async function embedify(link: string): Promise<EmbedInfo | null> {
  const fallback = (): EmbedInfo | null => {
    try {
      const url = new URL(link);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;

      return {
        url: backup(link),
        filename: null,
      };
    } catch {
      return null;
    }
  };

  try {
    const response = await fetch("https://cobalt.lowryb.sbs", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Api-Key ${process.env.COBALT_KEY}`,
      },
      body: JSON.stringify({
        url: link,
      }),
    });

    if (!response.ok) return fallback();

    const result = await response.json();
    if (
      typeof result?.url !== "string" ||
      typeof result?.filename !== "string"
    ) {
      return fallback();
    }

    return {
      url: result.url,
      filename: result.filename,
    };
  } catch {
    return fallback();
  }
}

export function backup(originalLink: string) {
  try {
    const url = new URL(originalLink);
    const hostname = url.hostname.toLowerCase();

    if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) {
      url.hostname = "oginstagram.com";
    } else if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) {
      url.hostname = "tnktok.com";
    }

    return url.toString();
  } catch {
    return originalLink;
  }
}
