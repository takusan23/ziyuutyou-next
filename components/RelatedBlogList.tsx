import ContentFolderManager from "../src/ContentFolderManager"
import BlogListItem from "./BlogListItem"
import RoundedCornerList from "./RoundedCornerList"

/** RelatedBlogList へ渡す Props */
type RelatedBlogListProps = {
    /** 本記事の URL */
    url: string
    /** 本記事のタグ */
    tags: string[]
    /** 件数 */
    maxSize: number
}

/** 関連記事を表示する */
export default async function RelatedBlogList({ url, tags, maxSize }: RelatedBlogListProps) {
    const relatedBlogList = await ContentFolderManager.findRelatedBlogItemList(url, tags, maxSize)

    // 空っぽなら早期 return
    if (relatedBlogList.length === 0) return <></>

    return (
        <div className="flex-1 flex flex-col space-y-2">
            <p className="py-3 text-content-primary-light dark:text-content-primary-dark text-2xl">
                関連記事
            </p>
            <RoundedCornerList
                list={relatedBlogList}
                content={(className, blogItem) => (
                    <div
                        className={`bg-container-primary-light dark:bg-container-primary-dark ${className}`}
                        key={blogItem.link}
                    >
                        <BlogListItem
                            blogItem={{
                                link: blogItem.link,
                                title: blogItem.title,
                                createdAt: blogItem.createdAt
                            }} />
                    </div>
                )}
            />
        </div>
    )
}