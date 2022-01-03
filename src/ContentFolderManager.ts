import BlogItem from "./data/BlogItem";
import fs from "fs"
import MarkdownParser from "./MarkdownParser";

/**
 * `content`フォルダにあるコンテンツを取得する関数がある。
 * 
 * この関数は静的書き出し（意味深）時に呼ばれる。
 */
class ContentFolderManager {

    /** 記事を保存しているフォルダパス。process.cwd()はnpm run devしたときのフォルダパス？ */
    static POSTS_FOLDER_PATH = `${process.cwd()}/content/posts`

    /** 固定ページを保存しているフォルダパス */
    static PAGES_FOLDER_PATH = `${process.cwd()}/content/pages`

    /** ブログ記事のベースURL */
    static POSTS_BASE_URL = `/posts`

    /**
     * 記事一覧を取得する
     * 
     * asyncです。
     * 
     * @param skip ページネーション用。どこまでスキップするか ((現在のページ - 1) * limit) を入れればいいと思う
     * @param limit 一度にどれだけ取得するか
     * @returns 合計記事数と取得した記事配列をまとめたものが返ってきます
     */
    static async getBlogItemList(limit: number = 10, skip: number) {
        // content/posts の中身を読み出す
        const postFileList = fs.readdirSync(this.POSTS_FOLDER_PATH)
        // Markdownパーサーへかける
        const markdownParsePromiseList = postFileList
            .map(fileName => `${this.POSTS_FOLDER_PATH}/${fileName}`)
            .map(filePath => MarkdownParser.parse(filePath, this.POSTS_BASE_URL))
        // Promiseの結果を全部待つ。mapの中でawait使えなかった；；
        const markdownDataList = await Promise.all(markdownParsePromiseList)
        const blogList = markdownDataList
            // 新しい順に並び替え。なんでこれで動くのかは知らないです（）
            .sort((a, b) => b.createdAtUnixTime - a.createdAtUnixTime)
            // 一覧用に変換
            .map(data => <BlogItem>{
                title: data.title,
                createdAt: data.createdAt,
                description: data.html.substring(0, 100),
                link: data.link,
                tags: data.tags
            })

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

export default ContentFolderManager