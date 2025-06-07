import BlogItem from "./BlogItem"

/** ブログ記事前後を表す。前 or 後が無い場合は undefined */
type PrevNextBlogItemData = {
    /** 次の記事 */
    next?: BlogItem
    /** 前の記事 */
    prev?: BlogItem
}

export default PrevNextBlogItemData