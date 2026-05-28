import type { MangaPage } from "@yui540/comimi-react";

const sampleImages = import.meta.glob("../sample-comic/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const imagePages: MangaPage[] = Object.entries(sampleImages)
  .map(([path, url]) => {
    const match = path.match(/\/(\d+)\.webp$/);
    if (!match) return null;
    return { index: Number(match[1]), url };
  })
  .filter((entry): entry is { index: number; url: string } => entry !== null)
  .sort((a, b) => a.index - b.index)
  .map(({ index, url }) => ({
    id: `p${index}`,
    type: "image",
    src: url,
    alt: `Page ${index + 1}`,
  }));

const outroPage: MangaPage = {
  id: "outro",
  type: "html",
  html: `
    <div style="
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      width: 100%;
      height: 100%;
      background: #fff;
      color: #333;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      text-align: center;
      padding: 32px;
    ">
      <div style="font-size: 18px; font-weight: 700;">
        最後までご覧いただきありがとうございます
      </div>
      <a
        href="https://yui540.com"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: inline-block;
          padding: 14px 28px;
          background: #333;
          color: #fff;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.02em;
        "
      >
        yui540.com →
      </a>
    </div>
  `,
};

export const samplePages: MangaPage[] = [...imagePages, outroPage];
