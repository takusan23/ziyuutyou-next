import BlogItem from "./data/BlogItem";
import fs from "fs"
import MarkdownParser from "./MarkdownParser";
import path from "path"

/**
 * `content`フォルダにあるコンテンツを取得する関数がある。
 * 
 * この関数は静的書き出し（意味深）時に呼ばれる。
 */
class ContentFolderManager {

    /** 記事を保存しているフォルダパス。process.cwd()はnpm run devしたときのフォルダパス？どの階層で呼んでも同じパスになるよう */
    static POSTS_FOLDER_PATH = `${process.cwd()}/content/posts`

    /** 固定ページを保存しているフォルダパス */
    static PAGES_FOLDER_PATH = `${process.cwd()}/content/pages`

    /** ブログ記事のベースURL */
    static POSTS_BASE_URL = `/posts`

    /** 固定ページのベースURL */
    static PAGES_BASE_URL = `/pages`

    /** 含まれたタグの記事一覧のベースURL */
    static POSTS_INCLUDE_TAG_LIST = `/posts/tag`

    /**
     * 書き出す必要のある固定ページのファイル名配列を返す
     * 
     * @returns ファイル名一覧
     */
    static getPageNameList() {
        return this.getFileNameList(this.PAGES_FOLDER_PATH)
    }

    /**
     * 書き出す必要のある記事一覧のファイル名配列を返す
     * 
     * @returns ファイル名一覧
     */
    static getBlogNameList() {
        return this.getFileNameList(this.POSTS_FOLDER_PATH)
    }

    /**
     * 範囲を指定して記事一覧を取得する
     * 
     * asyncです。
     * 
     * @param skip ページネーション用。どこまでスキップするか ((現在のページ - 1) * limit) を入れればいいと思う
     * @param limit 一度にどれだけ取得するか
     * @returns 合計記事数と取得した記事配列をまとめたものが返ってきます
     */
    static async getBlogItemList(limit: number = 10, skip: number) {
        // content/posts の中身を読み出す
        const blogList = await this.getItemList(this.POSTS_FOLDER_PATH, this.POSTS_BASE_URL)
        return {
            totalCount: blogList.length,
            result: blogList.slice(skip, skip + limit)
        } as BlogItemResult
    }

    /**
     * 記事のMarkdownを読み込んで返す
     * 
     * @param fileName ファイル名 
     * @returns パース結果
     */
    static async getBlogItem(fileName: string) {
        // 拡張子！！！！
        const filePath = `${this.POSTS_FOLDER_PATH}/${fileName}.md`
        return this.getItem(filePath, this.POSTS_BASE_URL)
    }

    /**
     * 固定ページのMarkdownを読み込んで返す
     * 
     * @param fileName ファイル名
     * @returns パース結果
     */
    static async getPageItem(fileName: string) {
        // 拡張子！！！！
        const filePath = `${this.PAGES_FOLDER_PATH}/${fileName}.md`
        return this.getItem(filePath, this.PAGES_BASE_URL)
    }

    /**
     * 指定したタグが含まれた記事一覧配列を返す
     * 
     * @param tagName タグ名
     * @param skip ページネーション用。どこまでスキップするか ((現在のページ - 1) * limit) を入れればいいと思う
     * @param limit 一度にどれだけ取得するか
     * @returns 頼まれた分の記事一覧配列
     */
    static async getTagFilterBlogItem(tagName: string, limit: number = 10, skip: number) {
        // とりあえず全件取得
        const blogList = await this.getItemList(this.POSTS_FOLDER_PATH, this.POSTS_BASE_URL)
        // フィルターにかけて
        const filteredList = blogList
            .filter((blog) => blog.tags.includes(tagName))
            // .slice(skip, skip + limit)
        return {
            totalCount: blogList.length,
            result: filteredList
        } as BlogItemResult
    }

    /**
     * 投稿した記事すべて読み込んで追加したことがあるタグ一覧を作成する
     */
    static async getAllTagList() {
        const blogList = await this.getItemList(this.POSTS_FOLDER_PATH, this.POSTS_BASE_URL)
        // flatに
        const allTagList = blogList
            .flatMap((blog) => blog.tags)
        // 重複を消す
        const allTagListDeleteDistinct = Array.from(new Set(allTagList))
        return allTagListDeleteDistinct
    }

    /** Markdownを読み込んで解析して返す */
    private static async getItem(filePath: string, baseUrl: string) {
        const markdownData = await MarkdownParser.parse(filePath, baseUrl)
        return markdownData
    }

    /** 引数のフォルダパスの中身をファイル名配列として返す */
    private static getFileNameList(folderPath: string) {
        return fs.readdirSync(folderPath)
            .map(name => path.parse(name).name)
    }

    /** 指定パスのフォルダに入ってる記事一覧を返す */
    private static async getItemList(folderPath: string, baseUrl: string) {
        // content/posts の中身を読み出す
        const postFileList = fs.readdirSync(folderPath)
        // Markdownパーサーへかける
        const markdownParsePromiseList = postFileList
            .map(fileName => `${folderPath}/${fileName}`)
            .map(filePath => MarkdownParser.parse(filePath, baseUrl))
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
        return blogList
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