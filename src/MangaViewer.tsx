import {
  forwardRef,
  useImperativeHandle,
  type HTMLAttributes,
} from "react";
import type { MangaViewerInstance } from "@yui540/comimi";
import {
  pickViewerEventProps,
  useMangaViewer,
  VIEWER_EVENT_PROP_NAMES,
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
      ...rest
    } = props;

    // イベント props は div に渡さない。
    const divProps: Record<string, unknown> = { ...rest };
    for (const name of VIEWER_EVENT_PROP_NAMES) {
      delete divProps[name];
    }

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
      ...pickViewerEventProps(rest),
    });

    useImperativeHandle(ref, () => viewer as MangaViewerHandle, [viewer]);

    return (
      <>
        <div
          ref={containerRef}
          {...(divProps as Omit<HTMLAttributes<HTMLDivElement>, "children">)}
        />
        {portals}
      </>
    );
  },
);
