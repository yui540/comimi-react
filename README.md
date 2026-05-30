# @yui540/comimi-react

[@yui540/comimi](https://www.npmjs.com/package/@yui540/comimi) を React で扱うための薄いラッパーライブラリです。`<MangaViewer />` コンポーネントと `useMangaViewer()` フックの2通りの使い方を提供します。

## 特徴

- ✅ **コンポーネント / フック両対応** — お好みのスタイルで使えます
- ✅ **完全な型サポート** — comimi の型を再エクスポート、TypeScript で安心して書けます
- ✅ **薄いラッパー** — 機能を一切削っていません。comimi の全 API にアクセス可能
- ✅ **React 18 / 19 両対応** — StrictMode 安全
- ✅ **ESM / CJS 両対応**
- ✅ **依存ゼロ** — comimi と React/ReactDOM は peer dependency

## インストール

```sh
npm install @yui540/comimi-react @yui540/comimi
```

`react` / `react-dom` / `@yui540/comimi` は peer dependency です。利用側プロジェクトで別途インストールしてください。

## クイックスタート

```tsx
import { MangaViewer, type Manga } from "@yui540/comimi-react";

const manga: Manga = {
  id: "sample",
  title: "サンプル漫画",
  author: "yui540",
  pages: [
    { id: "p0", type: "image", src: "/pages/0.webp" },
    { id: "p1", type: "image", src: "/pages/1.webp" },
    { id: "p2", type: "image", src: "/pages/2.webp" },
  ],
};

export function App() {
  return (
    <MangaViewer
      manga={manga}
      locale="ja"
      settings={{ readingDirection: "rtl", pageTurnMode: "spread" }}
      onPageChange={({ pageIndex }) => console.log("page", pageIndex)}
      style={{ width: "100%", minHeight: 600 }}
    />
  );
}
```

これだけで漫画ビューワーが起動します。キーボード・ジェスチャー・設定パネル・i18n などは comimi の機能をそのまま利用できます。

## 使い方の選択

| | 向いているケース |
|---|---|
| **`<MangaViewer />`** | JSX に宣言的に書きたい / `className` や `style` で見た目を整えたい / 基本的な操作で十分 |
| **`useMangaViewer()`** | レイアウトをより細かく制御したい / 既存の DOM 構造に組み込みたい / ビューワー以外の UI と密に連携したい |

両者は内部実装を共有しており、機能差はありません。

---

## `<MangaViewer />` コンポーネント

### 基本

```tsx
<MangaViewer manga={manga} settings={{ readingDirection: "rtl" }} />
```

`HTMLDivElement` の属性（`className` / `style` / `id` / `aria-*` など）はすべて外側の `<div>` に転送されます。

### `ref` で命令的操作

```tsx
import { useRef } from "react";
import { MangaViewer, type MangaViewerHandle } from "@yui540/comimi-react";

function Reader() {
  const viewerRef = useRef<MangaViewerHandle>(null);

  return (
    <>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => viewerRef.current?.previousPage()}>前</button>
        <button onClick={() => viewerRef.current?.nextPage()}>次</button>
        <button onClick={() => viewerRef.current?.goToPage(0)}>最初</button>
      </div>
      <MangaViewer ref={viewerRef} manga={manga} />
    </>
  );
}
```

`MangaViewerHandle` は comimi の `MangaViewerInstance` と同じ型です。マウント完了前は `null`。

---

## `useMangaViewer()` フック

```tsx
import { useMangaViewer } from "@yui540/comimi-react";

function Reader() {
  const { containerRef, viewer } = useMangaViewer({
    manga,
    settings: { readingDirection: "rtl" },
    onPageChange: ({ pageIndex }) => console.log(pageIndex),
  });

  return (
    <div>
      <button onClick={() => viewer?.nextPage()}>次へ</button>
      <div ref={containerRef} style={{ minHeight: 600 }} />
    </div>
  );
}
```

| 戻り値 | 型 | 説明 |
|---|---|---|
| `containerRef` | `RefObject<HTMLDivElement \| null>` | ビューワーをマウントする div に渡す ref |
| `viewer` | `MangaViewerInstance \| null` | 命令的操作用のインスタンス。マウント完了前は `null` |
| `portals` | `ReactPortal[]` | React コンテンツページ（後述）を描画するポータル。**JSX のどこかに必ずレンダーしてください** |

> フックで React コンテンツページを使う場合は、`portals` を JSX にレンダーする必要があります（描画位置はどこでも構いません。実際の描画はページ内のホスト要素に対して行われます）。`<MangaViewer />` を使う場合は自動で処理されます。
>
> ```tsx
> const { containerRef, portals } = useMangaViewer({ manga });
> return (
>   <div>
>     <div ref={containerRef} style={{ minHeight: 600 }} />
>     {portals}
>   </div>
> );
> ```

---

## React コンポーネントをページに埋め込む

画像や HTML 文字列だけでなく、**React コンポーネントをそのままページの中身として渡せます**。`type: "html"` のページに `html`（文字列）の代わりに `content`（`ReactNode`）を指定してください。

```tsx
import { MangaViewer, type ReactManga } from "@yui540/comimi-react";

function App() {
  const [likes, setLikes] = useState(0);

  const manga: ReactManga = useMemo(
    () => ({
      id: "sample",
      title: "サンプル",
      pages: [
        { id: "p0", type: "image", src: "/pages/0.webp" },
        {
          id: "p1",
          type: "html",
          content: (
            <div style={{ padding: 24 }}>
              <h2>あとがき</h2>
              <button onClick={() => setLikes((n) => n + 1)}>
                いいね {likes}
              </button>
            </div>
          ),
        },
      ],
    }),
    [likes],
  );

  return <MangaViewer manga={manga} style={{ minHeight: 600 }} />;
}
```

- `content` は React の **ポータル**で描画されるため、`useState` などの状態・イベントハンドラ・hooks がそのまま動きます。
- **`content` の中身が変わると即座に反映されます**（上の例の「いいね」カウントなど）。ページ構成（ID・並び順・画像・HTML 文字列）が変わらない限り、ビューワーのリセットや再読み込みは発生しません。
- `manga` の型は `Manga` ではなく **`ReactManga`** を使ってください（`pages` に `content` を許可した型）。
- `content` を指定したページでは `html` は無視されます（`content` 未指定時のフォールバックとして併用も可能）。

> ⚠️ この機能は `@yui540/comimi` **0.3.2 以降**が必要です（ページに React のホスト要素をマウントする `HtmlPage.element` を利用します）。

---

## API リファレンス

### Props / Options

`<MangaViewer />` の props と `useMangaViewer()` のオプションは共通です。

| 名前 | 型 | 説明 |
|---|---|---|
| `manga` | `ReactManga` | **必須**。表示する漫画データ。`pages` の `type: "html"` ページには `content`（`ReactNode`）を指定可能 |
| `initialPageIndex` | `number` | 初期表示するページのインデックス |
| `locale` | `string` | UI 言語 (`"ja"` / `"en"` / `"zh-CN"` / `"ko"` / `"th"` / `"id"` または独自キー) |
| `translations` | `TranslationMap` | 翻訳キーの上書き / 追加 |
| `settings` | `Partial<ViewerSettings>` | 読書方向・見開き・ズーム範囲など |
| `storage` | `{ enabled?: boolean; databaseName?: string }` | IndexedDB による設定・進捗の永続化 |
| `resolvePageSrc` | `PageSrcResolver` | ページ画像 URL の動的解決（DRM / 認証付き fetch） |
| `lockLayoutMode` | `boolean` | レイアウトモードを `settings.layoutMode` に固定 |
| `mascot` | `MascotOption` | マスコット画像の差し替え（`{ src }` / `{ render }` / `false`） |
| `onReady` | `(e) => void` | ビューワー準備完了時 |
| `onPageChange` | `(e: { pageIndex, page }) => void` | ページ変更時 |
| `onSettingsChange` | `(e: { settings }) => void` | 設定変更時 |
| `onLayoutChange` | `(e: { layoutMode }) => void` | レイアウト変更時 |
| `onDestroy` | `() => void` | 破棄時 |

各設定値のデフォルトと意味は [comimi のドキュメント](https://github.com/yui540/comimi/blob/main/docs/USAGE.md) を参照してください。

### `MangaViewerHandle` / `viewer` インスタンスメソッド

| メソッド | 説明 |
|---|---|
| `goToPage(pageIndex)` | 指定ページへジャンプ |
| `nextPage()` / `previousPage()` | 次 / 前のページへ |
| `setManga(manga)` | 漫画を差し替える |
| `setPages(pages)` | ページ配列のみ差し替え |
| `updateSettings(partial)` | 設定をマージ更新 |
| `toggleOverlay(force?)` | オーバーレイの表示切替 |
| `toggleAutoPageTurn()` | 自動再生のオン / オフ |
| `toggleFullscreen()` | フルスクリーン切替 |
| `getState()` | 現在の `ViewerState` を取得（読み取り専用） |
| `on(eventName, handler)` | イベント購読。戻り値は解除関数 |
| `destroy()` | 明示的な破棄（通常は unmount で自動実行） |

---

## 動作仕様

### プロップ更新の挙動

| プロップ | 変更時の挙動 |
|---|---|
| `manga` | **ページ構成**（ID・並び順・画像 src・HTML 文字列など）が変わると `setManga()` を呼び出してリロード。React `content` だけの変更ではリロードせず、ポータル経由で即反映 |
| `settings` | 参照が変わると `updateSettings()` でマージ |
| その他 | **初回マウント時のみ反映**（下記） |

`locale` / `translations` / `mascot` / `resolvePageSrc` / `lockLayoutMode` / `storage` / `initialPageIndex` は comimi 側に動的更新の API が無いため、マウント時の値が固定されます。実行時に切り替えたい場合は `key` プロップで再マウントしてください。

```tsx
<MangaViewer key={locale} manga={manga} locale={locale} />
```

### 不要な再生成を避ける

`manga` はページ構成のシグネチャ（ID・並び順・画像 src・HTML 文字列など）で変更検知するため、毎レンダーで新しいオブジェクトを渡しても構成が同じならリロードは走りません。一方 `settings` は参照比較なので、毎レンダーで新しいオブジェクトを渡すと毎回 `updateSettings` が走ります。`useMemo` か外部定数で安定化させてください。

```tsx
const settings = useMemo(() => ({ readingDirection: "rtl" }), []);
```

### イベントハンドラの安定性

`onPageChange` 等のハンドラは内部 ref に保持されるため、毎レンダーで関数を作り直しても問題ありません（ビューワーは再生成されず、常に最新のハンドラが呼ばれます）。

### StrictMode

React 18+ の StrictMode による開発時の二重マウントに対応しています。`destroy()` 後に再生成されるため、副作用の重複は発生しません。

---

## レシピ

### DRM / 認証付き fetch（`resolvePageSrc`）

ページ画像をその場で復号したり、Authorization ヘッダ付きで取得して Blob URL に変換できます。

```tsx
<MangaViewer
  manga={manga}
  resolvePageSrc={async ({ page }) => {
    const res = await fetch(page.src, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }}
/>
```

- 解決結果は `page.id` 単位でキャッシュされ、再描画では再呼び出しされません
- Blob URL の `revokeObjectURL` はライブラリ側で行わないので、利用側で管理してください

### レイアウトモードを固定

```tsx
<MangaViewer
  manga={manga}
  settings={{ layoutMode: "browserFullscreen" }}
  lockLayoutMode
/>
```

レイアウト切替の UI とキーボードショートカット (N / W / F / Esc) が無効化されます。

### マスコットの差し替え

```tsx
<MangaViewer manga={manga} mascot={{ src: "/my-mascot.png", alt: "Mascot" }} />
```

完全カスタムにしたい場合は `{ render: () => HTMLElement }`、非表示にしたい場合は `false` を渡します。

### `ViewerState` をリアクティブに購読

組み込みの状態購読フックは提供していません。コールバックや `viewer.on()` で必要な値だけ React state に持ち上げてください。

```tsx
function Reader() {
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <MangaViewer
      manga={manga}
      onPageChange={(e) => setPageIndex(e.pageIndex)}
    />
  );
}
```

---

## 注意点

### SSR / Next.js

comimi は DOM・IndexedDB・Fullscreen API などを使用するため、サーバーサイドでレンダリングできません。Next.js の App Router や Pages Router で利用する場合は、クライアント側で動的 import するか `"use client"` を付与してください。

```tsx
// Next.js (App Router)
"use client";
import { MangaViewer } from "@yui540/comimi-react";
```

### 型のエクスポート

comimi 側の主要な型に加え、React コンテンツ用の型（`ReactManga` / `ReactMangaPage` / `ReactHtmlPage`）も本パッケージからエクスポートされています。

```ts
import type {
  // React 用
  ReactManga,
  ReactMangaPage,
  ReactHtmlPage,
  // comimi 再エクスポート
  Manga,
  MangaPage,
  ImagePage,
  HtmlPage,
  ViewerSettings,
  ViewerState,
  ReadingDirection,
  LayoutMode,
  PageTurnMode,
  TranslationMap,
  ViewerEventMap,
  MangaViewerInstance,
} from "@yui540/comimi-react";
```

---

## 開発

```sh
npm install
npm run dev        # examples/preview を Vite で起動
npm run typecheck
npm run build      # dist/ に ESM・CJS・.d.ts を出力
```

`examples/preview/` には `<MangaViewer />` 版と `useMangaViewer()` 版をタブで切り替えられるプレビューが含まれています。

---

## ライセンス

[MIT](./LICENSE)

## クレジット

本ライブラリは [yui540/comimi](https://github.com/yui540/comimi) のラッパーです。ビューワー本体の機能・デザイン・サンプル画像はすべて comimi 本体のものです。
