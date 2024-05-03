"use client"

import { useEffect, useState } from "react"
import SearchForm from "../../components/search/SearchForm"
import { PagefindSearchFragment, PagefindSearchResult, PagefindSearchResults } from "../../src/data/PagefindData"
import SearchResult from "../../components/search/SearchResult"
import CircleLoading from "../../components/CircleLoading"
import SearchImage from "../../public/search.svg"
// SVG に色を当てるための CSS。
import "../../styles/css/svg-css.css"

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

/** 検索画面のクライアントコンポーネント。useState / onClick / fetch はクライアントコンポーネントでしか使えないので */
export default function PagefindSearch() {
    // キーワード
    const [searchWord, setSearchWord] = useState('')
    // 検索結果
    const [searchResult, setSearchResult] = useState<PagefindSearchFragment[]>()
    // ロード中かどうか
    const [isLoading, setIsLoading] = useState(false)

    // pagefind を読み込む
    // window.pagefind が使えるように 
    // なんでこんな回りくどい方法を取っているかというと、pagefind は静的書き出し後に生成する JavaScript をロードする必要があり、開発時は使えない。
    useEffect(() => {
        (async () => {
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
        })();
    }, [])

    /**
     * 検索する
     * @param keyword 検索ワード
     */
    async function search(keyword: string) {
        if (window["pagefind"]) {
            // ロード中へ
            setIsLoading(true)
            // 検索する
            const pagefindResult = await window["pagefind"].search(keyword) as PagefindSearchResults
            // ロードする
            const searchResultFragmentList = await Promise.all(pagefindResult.results.slice(0, 10).map((r) => r.data()))
            // 文字制限したい
            const formatTextResultFragmentList = searchResultFragmentList.map((fragment) => ({ ...fragment, content: fragment.content.substring(0, 100) }))
            // UI に反映
            setSearchResult(formatTextResultFragmentList)
            setIsLoading(false)
        }
    }

    // 検索画面の画像
    const searchLogoElement = (
        <SearchImage
            className="theme_color"
            width={200}
            height={100} />
    )

    return (
        <div className="flex flex-col items-center w-full space-y-6">

            <SearchForm
                text={searchWord}
                onChange={setSearchWord}
                onExecure={() => search(searchWord)}
            />

            {(() => {

                // ロード中
                if (isLoading) {
                    return <CircleLoading />
                }

                // まだ検索してない
                if (!searchResult) {
                    return searchLogoElement
                }

                // 検索したけど 0 件だった
                if (searchResult.length === 0) {
                    return (
                        <>
                            {searchLogoElement}
                            <p className="text-content-primary-light dark:text-content-primary-dark">
                                検索結果が見つかりませんでした。
                            </p>
                        </>
                    )
                }

                // 検索結果を出す
                return <SearchResult resultList={searchResult} />

            })()}

            <p className="text-content-primary-light dark:text-content-primary-dark">
                pagefind ライブラリを利用した検索機能です。10 件まで表示されます。
            </p>

        </div >
    )
}