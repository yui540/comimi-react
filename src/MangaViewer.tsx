import {
  forwardRef,
  useImperativeHandle,
  type HTMLAttributes,
} from "react";
import type { MangaViewerInstance } from "@yui540/comimi";
import {
  useMangaViewer,
  type UseMangaViewerOptions,
} from "./useMangaViewer";

export interface MangaViewerProps
  extends UseMangaViewerOptions,
    Omit<HTMLAttributes<HTMLDivElement>, "children"> {}

export type MangaViewerHandle = MangaViewerInstance;

export const MangaViewer = forwardRef<MangaViewerHandle, MangaViewerProps>(
  function MangaViewer(props, ref) {
    const {
      manga,
      initialPageIndex,
      initialPageQueryParam,
      locale,
      translations,
      settings,
      storage,
      resolvePageSrc,
      lockLayoutMode,
      mascot,
      hiddenSettings,
      forceSettings,
      onReady,
      onPageChange,
      onSettingsChange,
      onLayoutChange,
      onDestroy,
      ...divProps
    } = props;

    const { containerRef, viewer, portals } = useMangaViewer({
      manga,
      initialPageIndex,
      initialPageQueryParam,
      locale,
      translations,
      settings,
      storage,
      resolvePageSrc,
      lockLayoutMode,
      mascot,
      hiddenSettings,
      forceSettings,
      onReady,
      onPageChange,
      onSettingsChange,
      onLayoutChange,
      onDestroy,
    });

    useImperativeHandle(ref, () => viewer as MangaViewerHandle, [viewer]);

    return (
      <>
        <div ref={containerRef} {...divProps} />
        {portals}
      </>
    );
  },
);
