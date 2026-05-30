import { useMemo, useState } from "react";
import { MangaViewer, type ReactManga } from "@yui540/comimi-react";
import { imagePages } from "./samplePages";

/**
 * React コンテンツページのデモ。
 * 最終ページに React コンポーネントを埋め込み、状態が変わると
 * （ビューワーを作り直さずに）即座に反映されることを示す。
 */
export function ReactContentExample() {
  const [likes, setLikes] = useState(0);
  const [now, setNow] = useState(() => new Date().toLocaleTimeString());

  const manga: ReactManga = useMemo(
    () => ({
      id: "sample-comic",
      title: "React コンテンツ",
      author: "yui540",
      pages: [
        ...imagePages,
        {
          id: "react-outro",
          type: "html",
          label: "あとがき",
          content: (
            <div
              style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                width: "100%",
                height: "100%",
                padding: 32,
                background: "#fff",
                color: "#333",
                textAlign: "center",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                React コンポーネントをそのまま埋め込めます
              </div>
              <button
                onClick={() => setLikes((n) => n + 1)}
                style={{
                  padding: "12px 24px",
                  borderRadius: 999,
                  border: "none",
                  background: "#333",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ♥ いいね {likes}
              </button>
              <div style={{ fontSize: 12, color: "#999" }}>
                最終更新: {now}
              </div>
            </div>
          ),
        },
      ],
    }),
    [likes, now],
  );

  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        ページ外のボタンから最終ページ（React コンテンツ）の状態を更新しても、
        ビューワーは再読み込みされません。
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setLikes((n) => n + 1)}>外から ♥ +1</button>
        <button onClick={() => setNow(new Date().toLocaleTimeString())}>
          時刻を更新
        </button>
      </div>
      <MangaViewer
        manga={manga}
        locale="ja"
        settings={{
          layoutMode: "inline",
          hasCover: true,
          readingDirection: "rtl",
        }}
        style={{ width: "100%", minHeight: 600 }}
      />
    </div>
  );
}
