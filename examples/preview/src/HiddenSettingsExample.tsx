import { useMemo, useRef, useState } from "react";
import {
  MangaViewer,
  type HideableControl,
  type Manga,
  type MangaViewerHandle,
} from "@yui540/comimi-react";
import { samplePages } from "./samplePages";

const manga: Manga = {
  id: "sample-comic",
  title: "モノクロ世界にようこそ",
  author: "yui540",
  pages: samplePages,
};

// HideableControl の全項目と日本語ラベル。
// 設定パネルの行（locale / cover / direction / interval / backgroundColor）と
// ツールバーの操作（pageMode / autoplay / viewMode）を個別に隠せる。
const controls: { key: HideableControl; label: string; group: string }[] = [
  { key: "locale", label: "言語", group: "設定パネル" },
  { key: "cover", label: "表紙", group: "設定パネル" },
  { key: "direction", label: "読み方向", group: "設定パネル" },
  { key: "interval", label: "自動再生の間隔", group: "設定パネル" },
  { key: "backgroundColor", label: "背景色", group: "設定パネル" },
  { key: "pageMode", label: "ページめくりモード", group: "ツールバー" },
  { key: "autoplay", label: "自動再生", group: "ツールバー" },
  { key: "viewMode", label: "表示モード", group: "ツールバー" },
];

const groups = ["設定パネル", "ツールバー"];

export function HiddenSettingsExample() {
  const viewerRef = useRef<MangaViewerHandle>(null);
  const [hidden, setHidden] = useState<Set<HideableControl>>(new Set());

  const hiddenSettings = useMemo<HideableControl[]>(
    () => controls.map((c) => c.key).filter((k) => hidden.has(k)),
    [hidden],
  );

  const toggle = (key: HideableControl) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        隠したい UI 項目をチェックすると <code>hiddenSettings</code>{" "}
        に反映されます。設定パネルの全項目を隠すと設定ボタン自体も消えます。
      </p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
        {groups.map((group) => (
          <fieldset
            key={group}
            style={{
              border: "1px solid #999",
              borderRadius: 6,
              padding: "8px 16px 12px",
            }}
          >
            <legend style={{ fontWeight: 700, padding: "0 6px" }}>{group}</legend>
            {controls
              .filter((c) => c.group === group)
              .map((c) => (
                <label
                  key={c.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 0",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hidden.has(c.key)}
                    onChange={() => toggle(c.key)}
                  />
                  <span>
                    {c.label}{" "}
                    <code style={{ color: "#555" }}>{c.key}</code>
                  </span>
                </label>
              ))}
          </fieldset>
        ))}
      </div>

      <p style={{ fontFamily: "monospace", fontSize: 13 }}>
        hiddenSettings = [{hiddenSettings.map((k) => `"${k}"`).join(", ")}]
      </p>

      {/*
        hiddenSettings はビューワー初期化時にのみ適用されるため、
        変更時は key を切り替えて再マウントし、新しい設定で作り直す。
      */}
      <MangaViewer
        key={hiddenSettings.join("|")}
        ref={viewerRef}
        manga={manga}
        locale="ja"
        hiddenSettings={hiddenSettings}
        settings={{
          layoutMode: "inline",
          hasCover: true,
          readingDirection: "rtl",
        }}
        onReady={() =>
          console.log("[hiddenSettings] ready:", hiddenSettings)
        }
        style={{ width: "100%", minHeight: 600 }}
      />
    </div>
  );
}
