import { useState } from "react";
import {
  useMangaViewer,
  type Manga,
  type ReadingDirection,
} from "@yui540/comimi-react";
import { samplePages } from "./samplePages";

const manga: Manga = {
  id: "sample-comic",
  title: "モノクロ世界にようこそ",
  author: "yui540",
  pages: samplePages,
};

export function HookExample() {
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<ReadingDirection>("rtl");

  const { containerRef, viewer } = useMangaViewer({
    manga,
    locale: "ja",
    settings: {
      layoutMode: "inline",
      hasCover: true,
      readingDirection: direction,
    },
    onReady: ({ manga }) => console.log("[hook] ready:", manga.title),
    onPageChange: ({ pageIndex }) => {
      setPageIndex(pageIndex);
      console.log("[hook] pageChange", pageIndex + 1);
    },
  });

  return (
    <div>
      <p>
        現在のページ: {pageIndex + 1} / {manga.pages.length} —{" "}
        viewer: {viewer ? "ready" : "loading…"}
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => viewer?.previousPage()}>← 前</button>
        <button onClick={() => viewer?.nextPage()}>次 →</button>
        <button onClick={() => viewer?.goToPage(0)}>最初へ</button>
        <button onClick={() => viewer?.toggleAutoPageTurn()}>自動再生</button>
        <button
          onClick={() =>
            setDirection((d) => (d === "rtl" ? "ltr" : "rtl"))
          }
        >
          読み方向: {direction.toUpperCase()}
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ width: "100%", minHeight: 600 }}
      />
    </div>
  );
}
