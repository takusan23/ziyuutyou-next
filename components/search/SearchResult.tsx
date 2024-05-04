import Link from "next/link"
import RoundedCornerList from "../RoundedCornerList"
import { PagefindSearchFragment } from "../../src/data/PagefindData"

/** SearchResultItem へ渡すデータ */
type SearchResultItemProps = {
    /** 検索結果 */
    fragment: PagefindSearchFragment
}

/** SearchResult へ渡すデータ */
type SearchResultProps = {
    /** 検索結果。await した結果を渡してね。 */
    resultList: PagefindSearchFragment[]
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
export default function SearchResult({ resultList }: SearchResultProps) {
    return (
        <div className="flex flex-col items-center space-y-4">
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
