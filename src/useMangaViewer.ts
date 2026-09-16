import { useEffect, useRef, useState, type ReactPortal } from "react";
import { createPortal } from "react-dom";
import {
  createMangaViewer,
  type HtmlPage,
  type Manga,
  type MangaPage,
  type MangaViewerInstance,
  type MangaViewerOptions,
  type ViewerEventMap,
  type ViewerEventName,
} from "@yui540/comimi";
import { isReactContentPage, type ReactManga } from "./types";

/**
 * comimi の各イベントを `on<EventName>` 形式の props にしたもの。
 * 例: `pageChange` → `onPageChange`、`favoritesChange` → `onFavoritesChange`。
 */
export type ViewerEventProps = {
  [K in ViewerEventName as `on${Capitalize<K>}`]?: ViewerEventMap[K] extends void
    ? () => void
    : (event: ViewerEventMap[K]) => void;
};

const EVENT_NAMES = [
  "ready",
  "mangaChange",
  "pageChange",
  "settingsChange",
  "layoutChange",
  "overlayChange",
  "panelChange",
  "autoPageTurnChange",
  "zoomChange",
  "favoritesChange",
  "notification",
  "pageLoadError",
  "destroy",
] as const satisfies readonly ViewerEventName[];

type EventPropName = keyof ViewerEventProps;

function toPropName(eventName: ViewerEventName): EventPropName {
  return `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}` as EventPropName;
}

export const VIEWER_EVENT_PROP_NAMES: readonly EventPropName[] =
  EVENT_NAMES.map(toPropName);

/** props からイベントハンドラだけを取り出す。 */
export function pickViewerEventProps<T extends ViewerEventProps>(
  props: T,
): ViewerEventProps {
  const picked: Record<string, unknown> = {};
  for (const name of VIEWER_EVENT_PROP_NAMES) {
    if (props[name] !== undefined) picked[name] = props[name];
  }
  return picked as ViewerEventProps;
}

export interface UseMangaViewerOptions
  extends Omit<MangaViewerOptions, "events" | "className" | "manga">,
    ViewerEventProps {
  manga: ReactManga;
}

export interface UseMangaViewerResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  viewer: MangaViewerInstance | null;
  /** Portals that render React page content. Must be rendered by the consumer. */
  portals: ReactPortal[];
}

export function useMangaViewer(
  options: UseMangaViewerOptions,
): UseMangaViewerResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewer, setViewer] = useState<MangaViewerInstance | null>(null);

  // ハンドラは ref に保持し、毎レンダーで関数が変わってもビューワーを再生成しない。
  const handlersRef = useRef<ViewerEventProps>(pickViewerEventProps(options));
  handlersRef.current = pickViewerEventProps(options);

  // Stable host elements that React portals render into, keyed by page id.
  // Reusing the same element across renders lets the viewer cache the page
  // slot while React keeps full control over its contents.
  const portalContainersRef = useRef<Map<string, HTMLElement>>(new Map());
  const getPortalContainer = (id: string): HTMLElement => {
    let container = portalContainersRef.current.get(id);
    if (!container) {
      container = document.createElement("div");
      container.className = "comimi-react-page";
      container.style.width = "100%";
      container.style.height = "100%";
      portalContainersRef.current.set(id, container);
    }
    return container;
  };

  // Convert a ReactManga into a core Manga, swapping React-content pages for
  // HTML pages backed by their stable host element.
  const toCoreManga = (manga: ReactManga): Manga => {
    const pages: MangaPage[] = manga.pages.map((page) => {
      if (isReactContentPage(page)) {
        const { content: _content, html: _html, ...rest } = page;
        return { ...rest, element: getPortalContainer(page.id) } as HtmlPage;
      }
      return page as MangaPage;
    });
    return { ...manga, pages };
  };

  const initialOptionsRef = useRef<
    Omit<MangaViewerOptions, "manga" | "events">
  >({
    initialPageIndex: options.initialPageIndex,
    initialPageQueryParam: options.initialPageQueryParam,
    locale: options.locale,
    translations: options.translations,
    settings: options.settings,
    storage: options.storage,
    resolvePageSrc: options.resolvePageSrc,
    lockLayoutMode: options.lockLayoutMode,
    mascot: options.mascot,
    hiddenSettings: options.hiddenSettings,
    forceSettings: options.forceSettings,
  });
  const mangaRef = useRef<ReactManga>(options.manga);
  mangaRef.current = options.manga;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const events: NonNullable<MangaViewerOptions["events"]> = {};
    for (const eventName of EVENT_NAMES) {
      const propName = toPropName(eventName);
      (events as Record<string, (payload: unknown) => void>)[eventName] = (
        payload: unknown,
      ) => {
        const handler = handlersRef.current[propName] as
          | ((payload: unknown) => void)
          | undefined;
        handler?.(payload);
      };
    }

    const instance = createMangaViewer(container, {
      ...initialOptionsRef.current,
      manga: toCoreManga(mangaRef.current),
      events,
    });

    setViewer(instance);

    return () => {
      instance.destroy();
      setViewer(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run setManga only when the page *structure* changes (ids, order, image
  // sources, raw html, etc.). React content changes are reflected through the
  // portals below, so they must not trigger a viewer reset.
  const signature = pageStructureSignature(options.manga);
  const signatureRef = useRef(signature);
  useEffect(() => {
    if (!viewer) return;
    if (signatureRef.current === signature) return;
    signatureRef.current = signature;
    void viewer.setManga(toCoreManga(mangaRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, signature]);

  const settingsRef = useRef(options.settings);
  useEffect(() => {
    if (!viewer) return;
    if (settingsRef.current === options.settings) return;
    settingsRef.current = options.settings;
    if (options.settings) {
      void viewer.updateSettings(options.settings);
    }
  }, [viewer, options.settings]);

  // Drop host elements for pages that no longer exist.
  useEffect(() => {
    const liveIds = new Set(options.manga.pages.map((page) => page.id));
    for (const id of portalContainersRef.current.keys()) {
      if (!liveIds.has(id)) {
        portalContainersRef.current.delete(id);
      }
    }
  });

  const portals = options.manga.pages
    .filter(isReactContentPage)
    .map((page) =>
      createPortal(page.content, getPortalContainer(page.id), page.id),
    );

  return { containerRef, viewer, portals };
}

function pageStructureSignature(manga: ReactManga): string {
  return JSON.stringify([
    manga.id,
    manga.pages.map((page) => {
      if (page.type === "image") {
        return ["image", page.id, page.src, page.alt ?? null];
      }
      return [
        "html",
        page.id,
        page.content !== undefined ? "react" : "string",
        page.html ?? null,
        page.aspectRatio ?? null,
        page.sandbox ?? null,
      ];
    }),
  ]);
}
