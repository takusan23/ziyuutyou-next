import BlogItem from "./data/BlogItem"

/**
 * Markdownで書かれた記事を取得する関数があるクラス
 */
class BlogContentManager {

    /**
     * 記事一覧を取得する
     * 
     * @param skip ページネーション用。どこまでスキップするか
     * @param limit 一度にどれだけ取得するか
     * @returns 合計記事数と取得した記事配列をまとめたものが返ってきます
     */
    static async getBlogItemList(limit: number = 10, skip: number) {
        const blogList = Array<BlogItem>()
        for (let i = 0; i < 53; i++) {
            blogList.push({
                title: `テスト記事 ${i}`,
                link: "/",
                createdAt: "2022-01-03",
                tags: ['Android'],
                description: "どうもこんばんわ。"
            })
        }
        return {
            totalCount: blogList.length,
            result: blogList.slice(skip, skip + limit)
        } as BlogItemResult
    }

}

/** 記事一覧の返り値 */
interface BlogItemResult {
    /** 合計記事数 */
    totalCount: number;
    /** 取得した記事一覧 */
    result: Array<BlogItem>;
}


export default BlogContentManager