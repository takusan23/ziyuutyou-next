import { use } from "react"
import Link from "next/link"
import RoundedCornerList from "../RoundedCornerList"
import { PagefindSearchFragment } from "../../src/data/PagefindData"
import SearchLogoMessage from "../../app/search/SearchLogoMessage"

/** SearchResultItem へ渡すデータ */
type SearchResultItemProps = {
    /** 検索結果 */
    fragment: PagefindSearchFragment
}

/** SearchResult へ渡すデータ */
type SearchResultProps = {
    /** 検索結果 */
    resultListPromise: Promise<PagefindSearchFragment[]>
}

/** 検索結果一覧の各コンポーネント */
function SearchResultItem({ fragment }: SearchResultItemProps) {
    return (
        <div className="flex flex-col p-5">
            <Link href={fragment.url}>
                <h2 className="text-2xl underline text-content-primary-light dark:text-content-primary-dark">
                    {fragment.meta['title']}
                </h2>
            </Link>
            <p className="py-2 text-sm text-content-primary-light dark:text-content-primary-dark">
                {fragment.content}
            </p>
        </div>
    )
}

/** 検索結果を表示する */
export default function SearchResult({ resultListPromise }: SearchResultProps) {
    // Promise を待つ
    const resultList = use(resultListPromise)

    // 検索したけど 0 件だった
    if (resultList.length === 0) {
        return <SearchLogoMessage message="検索結果がありませんでした" />
    }

    // 結果
    return (
        <div className="flex w-full flex-col items-center space-y-4">
            <RoundedCornerList
                list={resultList}
                content={(className, fragment) => (
                    <div
                        className={`bg-container-primary-light dark:bg-container-primary-dark ${className}`}
                        key={fragment.url}
                    >
                        <SearchResultItem fragment={fragment} />
                    </div>
                )}
            />
        </div>
    )
}
