import { useEffect, useRef, useState } from "react";
import {
  createMangaViewer,
  type Manga,
  type MangaViewerInstance,
  type MangaViewerOptions,
  type ViewerEventMap,
} from "@yui540/comimi";

export interface UseMangaViewerOptions
  extends Omit<MangaViewerOptions, "events" | "className"> {
  onReady?: (event: ViewerEventMap["ready"]) => void;
  onPageChange?: (event: ViewerEventMap["pageChange"]) => void;
  onSettingsChange?: (event: ViewerEventMap["settingsChange"]) => void;
  onLayoutChange?: (event: ViewerEventMap["layoutChange"]) => void;
  onDestroy?: () => void;
}

export interface UseMangaViewerResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  viewer: MangaViewerInstance | null;
}

export function useMangaViewer(
  options: UseMangaViewerOptions,
): UseMangaViewerResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewer, setViewer] = useState<MangaViewerInstance | null>(null);

  const handlersRef = useRef({
    onReady: options.onReady,
    onPageChange: options.onPageChange,
    onSettingsChange: options.onSettingsChange,
    onLayoutChange: options.onLayoutChange,
    onDestroy: options.onDestroy,
  });
  handlersRef.current = {
    onReady: options.onReady,
    onPageChange: options.onPageChange,
    onSettingsChange: options.onSettingsChange,
    onLayoutChange: options.onLayoutChange,
    onDestroy: options.onDestroy,
  };

  const initialOptionsRef = useRef<MangaViewerOptions>({
    manga: options.manga,
    initialPageIndex: options.initialPageIndex,
    locale: options.locale,
    translations: options.translations,
    settings: options.settings,
    storage: options.storage,
    resolvePageSrc: options.resolvePageSrc,
    lockLayoutMode: options.lockLayoutMode,
    mascot: options.mascot,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instance = createMangaViewer(container, {
      ...initialOptionsRef.current,
      events: {
        ready: (event) => handlersRef.current.onReady?.(event),
        pageChange: (event) => handlersRef.current.onPageChange?.(event),
        settingsChange: (event) =>
          handlersRef.current.onSettingsChange?.(event),
        layoutChange: (event) => handlersRef.current.onLayoutChange?.(event),
        destroy: () => handlersRef.current.onDestroy?.(),
      },
    });

    setViewer(instance);

    return () => {
      instance.destroy();
      setViewer(null);
    };
  }, []);

  const mangaRef = useRef<Manga>(options.manga);
  useEffect(() => {
    if (!viewer) return;
    if (mangaRef.current === options.manga) return;
    mangaRef.current = options.manga;
    void viewer.setManga(options.manga);
  }, [viewer, options.manga]);

  const settingsRef = useRef(options.settings);
  useEffect(() => {
    if (!viewer) return;
    if (settingsRef.current === options.settings) return;
    settingsRef.current = options.settings;
    if (options.settings) {
      void viewer.updateSettings(options.settings);
    }
  }, [viewer, options.settings]);

  return { containerRef, viewer };
}
