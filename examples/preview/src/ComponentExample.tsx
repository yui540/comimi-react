import { useRef, useState } from "react";
import {
  MangaViewer,
  type Manga,
  type MangaViewerHandle,
  type ViewerPanel,
} from "@yui540/comimi-react";
import { samplePages } from "./samplePages";

const manga: Manga = {
  id: "sample-comic",
  title: "モノクロ世界にようこそ",
  author: "yui540",
  pages: samplePages,
};

export function ComponentExample() {
  const viewerRef = useRef<MangaViewerHandle>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [panel, setPanel] = useState<ViewerPanel>("none");
  const [favoriteCount, setFavoriteCount] = useState(0);

  return (
    <div>
      <p>
        現在のページ: {pageIndex + 1} / {manga.pages.length} ／ パネル:{" "}
        <span data-testid="panel">{panel}</span> ／ ここすき！:{" "}
        <span data-testid="favorites">{favoriteCount}</span>
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => viewerRef.current?.nextPage()}>← 次</button>
        <button onClick={() => viewerRef.current?.previousPage()}>前 →</button>
        <button onClick={() => viewerRef.current?.goToPage(0)}>最初へ</button>
        <button onClick={() => viewerRef.current?.toggleAutoPageTurn()}>
          自動再生
        </button>
        <button onClick={() => viewerRef.current?.setPanel("favorites")}>
          ここすき！一覧
        </button>
        <button onClick={() => viewerRef.current?.notify("こんにちは", "success")}>
          トースト
        </button>
      </div>
      <MangaViewer
        ref={viewerRef}
        manga={manga}
        locale="ja"
        settings={{
          layoutMode: "inline",
          hasCover: true,
          readingDirection: "rtl",
        }}
        onReady={({ manga }) =>
          console.log("[component] ready:", manga.title)
        }
        onPageChange={({ pageIndex }) => {
          setPageIndex(pageIndex);
          console.log("[component] pageChange", pageIndex + 1);
        }}
        onPanelChange={({ panel }) => setPanel(panel)}
        onFavoritesChange={({ pageIds }) => setFavoriteCount(pageIds.length)}
        style={{ width: "100%", minHeight: 600 }}
      />
    </div>
  );
}
