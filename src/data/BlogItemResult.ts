import BlogItem from "./BlogItem";

/** 記事一覧の返り値 */
type BlogItemResult = {
    /** 合計記事数 */
    totalCount: number
    /** 取得した記事一覧 */
    pageList: BlogItem[][]
}

export default BlogItemResult