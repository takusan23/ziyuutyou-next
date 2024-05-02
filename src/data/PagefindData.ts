// pagefind の型。自前で作らないのないのかな、、、
// https://github.com/CloudCannon/pagefind/blob/main/pagefind_web_js/types/index.d.ts

/** await pagefind.search の返り値 */
export type PagefindSearchResults = {
    results: PagefindSearchResult[]
}
/** 各検索結果エントリ。data() を await することで詳細を取得する。 */
export type PagefindSearchResult = {
    id: string,
    data: () => Promise<PagefindSearchFragment>
}

/** PagefindSearchResult.data() の返り値 */
export type PagefindSearchFragment = {
    url: string,
    content: string,
    meta: Record<string, string>
}