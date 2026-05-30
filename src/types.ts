import type { ReactNode } from "react";
import type { HtmlPage, ImagePage, Manga } from "@yui540/comimi";

/**
 * An HTML page whose body is a React node instead of an HTML string.
 *
 * The node is rendered into a stable host element via a React portal, so its
 * contents update reactively as `content` changes — without recreating the
 * viewer or resetting the current page.
 */
export interface ReactHtmlPage extends Omit<HtmlPage, "html" | "element"> {
  type: "html";
  /** React content rendered into the page. Takes precedence over `html`. */
  content?: ReactNode;
  /** Raw HTML markup, used only when `content` is not provided. */
  html?: string;
}

/** A page that may carry React content in place of an HTML string. */
export type ReactMangaPage = ImagePage | ReactHtmlPage;

/** A manga whose pages may carry React content. */
export interface ReactManga extends Omit<Manga, "pages"> {
  pages: ReactMangaPage[];
}

/** Type guard for pages that should be rendered through a React portal. */
export function isReactContentPage(
  page: ReactMangaPage,
): page is ReactHtmlPage & { content: ReactNode } {
  return page.type === "html" && page.content !== undefined;
}
