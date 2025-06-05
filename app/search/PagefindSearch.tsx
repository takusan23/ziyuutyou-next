"use client"

import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import SearchForm from "../../components/search/SearchForm"
import CircleLoading from "../../components/CircleLoading"
import SearchLogoMessage from "./SearchLogoMessage"
import { PagefindSearchResult, PagefindSearchResults } from "../../src/data/PagefindData"
import SearchResult from "../../components/search/SearchResult"
import Title from "../../components/Title"

/** 開発時は適当な値を返す pagefind。UI の調整用。 */
function pagefindInDevMock() {
    // 適当にダミーを作って返す
    const results: PagefindSearchResult[] = (new Array(5)).fill(0).map((_, index) => ({
        id: 'example',
        data: () => new Promise((resolve) => resolve({
            url: `/posts/page/${index + 1}/`,
            content: 'process.env.NODE_ENV === development',
            meta: { 'title': `Page ${index + 1}` }
        }))
    }))
    const result: PagefindSearchResults = {
        results: results
    }
    return { search: () => new Promise<PagefindSearchResults>((resolve) => resolve(result)) }
}

/** pagefind が初期化されてない場合は初期化する */
async function initPagefind() {
    if (!window["pagefind"]) {
        try {
            window["pagefind"] = await import(
                    // @ts-expect-error pagefind.js generated after build
                    /* webpackIgnore: true */ "/pagefind/pagefind.js"
            )
        } catch (e) {
            // 開発時は適当にハードコートされた値を返す。本番は await import するはずなので問題ないはず
            if (process.env.NODE_ENV === 'development') {
                window["pagefind"] = pagefindInDevMock()
            }
        }
    }
}

/**
 * 検索する
 * @param searchWord 検索ワード
 */
async function executeSearchFromQueryParams(searchWord: string) {
    // pagefind が初期化されてない場合
    await initPagefind()
    // 検索する
    const pagefindResult = await window["pagefind"].search(searchWord) as PagefindSearchResults
    // ロードする
    const searchResultFragmentList = await Promise.all(pagefindResult.results.slice(0, 10).map((r) => r.data()))
    // 文字制限したい
    const formatTextResultFragmentList = searchResultFragmentList.map((fragment) => ({ ...fragment, content: fragment.content.substring(0, 100) }))
    // 返す
    return formatTextResultFragmentList
}

/** 検索画面 */
export default function PagefindSearch() {
    // クエリパラメータから取り出す
    const searchParams = useSearchParams()
    const searchWord = searchParams.get('q') ?? ''

    // 検索する Promise。検索結果に渡す
    // 多分 Promise オブジェクトは使い回す必要があるので、useMemo()
    const promiseObject = useMemo(() => executeSearchFromQueryParams(searchWord), [searchWord])

    return (
        <div className="flex flex-col max-w-6xl m-auto w-full space-y-6">

            <Title title="記事検索" />

            {/* 真ん中にする */}
            <div className="flex flex-col items-center space-y-6">

                <SearchForm searchWord={searchWord} />

                {
                    !searchWord
                        // 検索ワードがない
                        ? <SearchLogoMessage message="検索ワードを入力してください" />
                        // React 19 の use() と <Suspense> を使う
                        : (
                            <Suspense fallback={<CircleLoading />}>
                                <SearchResult resultListPromise={promiseObject} />
                            </Suspense>
                        )
                }

                <p className="text-content-primary-light dark:text-content-primary-dark">
                    pagefind ライブラリを利用した検索機能です。10 件まで表示されます。
                </p>

            </div>
        </div >
    )
}