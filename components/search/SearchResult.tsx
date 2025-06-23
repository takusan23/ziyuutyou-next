import { use } from "react"
import RoundedCornerList from "../RoundedCornerList"
import { PagefindSearchFragment } from "../../src/data/PagefindData"
import SearchLogoMessage from "../../app/search/SearchLogoMessage"
import BlogListItem from "../BlogListItem"

/** SearchResult へ渡すデータ */
type SearchResultProps = {
    /** 検索結果 */
    resultListPromise: Promise<PagefindSearchFragment[]>
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
                        <BlogListItem
                            blogItem={{
                                link: fragment.url,
                                title: fragment.meta['title'],
                                description: fragment.content
                            }} />
                    </div>
                )}
            />
        </div>
    )
}
