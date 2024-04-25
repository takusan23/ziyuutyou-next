import BlogItem from "./data/BlogItem"
import fs from "fs/promises"
import MarkdownParser from "./MarkdownParser"
import path from "path"
import TagData from "./data/TagData"
import BlogItemResult from "./data/BlogItemResult"
import { NextJsCacheStore } from "./NextJsCacheStore"
import MarkdownData from "./data/MarkdownData"

/**
 * content/posts フォルダにあるマークダウンファイルを取得したり、HTML パース結果を返すやつ。
 * この関数は静的書き出し（意味深）時に呼ばれる。ブラウザ側では利用できず、Node.js 側でのみ利用できます。
 */
class ContentFolderManager {

    /** マークダウンパース結果をキャッシュして使い回す。中身は Next.js の cache() です。 */
    private static cacheStore = new NextJsCacheStore<MarkdownData>()

    /** 記事を保存しているフォルダパス。process.cwd()はnpm run devしたときのフォルダパス？どの階層で呼んでも同じパスになるよう */
    static POSTS_FOLDER_PATH = path.join(process.cwd(), `content`, `posts`)

    /** 固定ページを保存しているフォルダパス */
    static PAGES_FOLDER_PATH = path.join(process.cwd(), `content`, `pages`)

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
    static async getPageNameList() {
        return this.getFileNameList(this.PAGES_FOLDER_PATH)
    }

    /**
     * 書き出す必要のある記事一覧のファイル名配列を返す
     * 
     * @returns ファイル名一覧
     */
    static async getBlogNameList() {
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
        const result: BlogItemResult = {
            totalCount: blogList.length,
            result: blogList.slice(skip, skip + limit)
        }
        return result
    }

    /**
     * 記事のMarkdownを読み込んで返す
     * 
     * @param fileName ファイル名 
     * @returns パース結果
     */
    static async getBlogItem(fileName: string) {
        // 拡張子！！！！
        const filePath = path.join(this.POSTS_FOLDER_PATH, `${fileName}.md`)
        return this.parseMarkdown(filePath, this.POSTS_BASE_URL)
    }

    /**
     * 固定ページのMarkdownを読み込んで返す
     * 
     * @param fileName ファイル名
     * @returns パース結果
     */
    static async getPageItem(fileName: string) {
        // 拡張子！！！！
        const filePath = path.join(this.PAGES_FOLDER_PATH, `${fileName}.md`)
        return this.parseMarkdown(filePath, this.PAGES_BASE_URL)
    }

    /**
     * 指定したタグが含まれた記事一覧配列を返す。
     * 
     * @param tagName タグ名
     * @returns 含まれている記事一覧
     */
    static async getTagFilterBlogItem(tagName: string) {
        // とりあえず全件取得
        const blogList = await this.getItemList(this.POSTS_FOLDER_PATH, this.POSTS_BASE_URL)
        // フィルターにかけて
        const filteredList = blogList
            .filter((blog) => blog.tags.includes(tagName))
        const result: BlogItemResult = {
            totalCount: filteredList.length,
            result: filteredList
        }
        return result
    }

    /**
     * 投稿した記事すべて読み込んで追加したことがあるタグ一覧を作成する
     */
    static async getAllTagDataList() {
        const blogList = await this.getItemList(this.POSTS_FOLDER_PATH, this.POSTS_BASE_URL)
        // タグの名前だけのflatにする
        const tagNameList = this.distinctFromList(
            blogList.flatMap((blog) => blog.tags)
        )
        // TagDataの配列にする。多い順にする
        const tagDataList: TagData[] = tagNameList
            .map((name) => ({
                name: name,
                count: blogList.filter((blogItem) => blogItem.tags.includes(name)).length
            }))
            .sort((a, b) => b.count - a.count)
        return tagDataList
    }

    /**
     * Markdown をパースして返す。
     * キャッシュがあればキャッシュを返します。
     * 
     * @param filePath ファイルパス
     * @param baseUrl /posts /pages など
     * @returns MarkdownData
     */
    private static async parseMarkdown(filePath: string, baseUrl: string) {
        // キャッシュがあるか問い合わせる
        const markdownData = await this.cacheStore.getCache(filePath, (_) => MarkdownParser.parse(filePath, baseUrl))
        return markdownData
    }

    /**
     * 引数のフォルダパスの中身をファイル名配列として返す
     * 
     * @param folderPath フォルダパス
     * @returns ファイル名の配列
     */
    private static async getFileNameList(folderPath: string) {
        return (await fs.readdir(folderPath)).map(name => path.parse(name).name)
    }

    /**
     * 指定パスのフォルダに入ってる記事一覧を返す。
     * キャッシュがあればそれを返します。
     * 
     * @param folderPath フォルダパス
     * @param baseUrl /posts /pages など
     * @returns BlogItem[]
     */
    private static async getItemList(folderPath: string, baseUrl: string) {
        // content/posts の中身を読み出す
        const postFileList = await fs.readdir(folderPath)
        // Markdownパーサーへかける
        const markdownParsePromiseList = postFileList
            .map(fileName => path.join(folderPath, fileName))
            .map(filePath => this.parseMarkdown(filePath, baseUrl))
        // Promiseの結果を全部待つ。mapの中でawait使えなかった；；
        const markdownDataList = await Promise.all(markdownParsePromiseList)
        const blogList: BlogItem[] = markdownDataList
            // 新しい順に並び替え。なんでこれで動くのかは知らないです（）
            .sort((a, b) => b.createdAtUnixTime - a.createdAtUnixTime)
            // 一覧用に変換
            .map(data => ({
                title: data.title,
                createdAt: data.createdAt,
                description: data.html.substring(0, 100),
                link: data.link,
                tags: data.tags
            }))
        return blogList
    }

    /**
     * 配列内から同じやつを消す
     * 
     * @param list 配列
     * @returns かぶりがない配列
     */
    private static distinctFromList<T>(list: Array<T>) {
        return Array.from(new Set(list))
    }

}

export default ContentFolderManager