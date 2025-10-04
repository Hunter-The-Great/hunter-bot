export async function embedify(link: string) {
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

    if (!response.ok) {
        try {
            new URL(link);
            return {
                url: backup(link),
                filename: null,
            };
        } catch {
            return null;
        }
    }

    const { url, filename } = await response.json();

    return {
        url,
        filename,
    };
}

export function backup(originalLink: string) {
    if (originalLink.includes("instagram.")) {
        originalLink = originalLink.replace("instagram", "kkinstagram");
    } else if (originalLink.includes("tiktok.")) {
        originalLink = originalLink.replace("tiktok", "tnktok");
    }
    return originalLink;
}
