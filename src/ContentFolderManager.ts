import BlogItem from "./data/BlogItem"
import fs from "fs/promises"
import MarkdownParser from "./MarkdownParser"
import path from "path"
import TagData from "./data/TagData"
import { NextJsCacheStore } from "./NextJsCacheStore"
import MarkdownData from "./data/MarkdownData"
import Pagination from "./data/Pagination"
import PrevNextBlogItemData from "./data/PrevNextBlogItemData"

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
        return await this.getFileNameList(this.POSTS_FOLDER_PATH)
    }

    /**
     * 書き出す必要のある記事一覧のファイル名配列を返す
     * {@see getBlogNameList}と{@see chunkedPage}の合体版
     * 
     * @param pageSize 1ページに何件表示するか
     * @returns ページ件数でまとめられた配列
     */
    static async getBlogNamePagination(pageSize: number) {
        const nameList = await this.getBlogNameList()
        const chunkedList = this.chunkedPage(nameList, pageSize)
        const result: Pagination<string> = {
            totalCount: nameList.length,
            pageList: chunkedList,
            pageNumberList: chunkedList.map((_, index) => index + 1)
        }
        return result
    }

    /**
     * 記事一覧を取得する
     * 
     * @return BlogItem[]
     */
    static async getBlogItemList() {
        // content/posts の中身を読み出す
        return await this.getItemList(this.POSTS_FOLDER_PATH, this.POSTS_BASE_URL)
    }

    /**
     * 記事一覧を取得する
     * {@see getBlogItemList}と{@see chunkedPage}の合体版
     * 
     * @param pageSize 1ページに何件表示するか
     * @returns 合計記事数と取得した記事配列をまとめたものが返ってきます
     */
    static async getBlogItemPagination(pageSize: number) {
        const blogList = await this.getBlogItemList()
        const chunkedList = this.chunkedPage(blogList, pageSize)
        const result: Pagination<BlogItem> = {
            totalCount: blogList.length,
            pageList: chunkedList,
            pageNumberList: chunkedList.map((_, index) => index + 1)
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
     * @param pageSize 1ページに何件表示するか
     * @returns 含まれている記事一覧
     */
    static async getTagFilterBlogItemList(tagName: string, pageSize: number) {
        // とりあえず全件取得
        const blogList = await this.getItemList(this.POSTS_FOLDER_PATH, this.POSTS_BASE_URL)
        // フィルターにかけて
        const filteredList = blogList.filter((blog) => blog.tags.includes(tagName))
        const chunkedList = this.chunkedPage(filteredList, pageSize)
        const result: Pagination<BlogItem> = {
            totalCount: filteredList.length,
            pageList: chunkedList,
            pageNumberList: chunkedList.map((_, index) => index + 1)
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
     * 記事の URL が、記事一覧の何ページ目にあるかを探す。
     * 問題があれば 1。
     * 
     * @param blogUrl URL
     * @param pageSize {@see getBlogItemPagination} と同じもの
     * @returns 1 始まりのページ番号
     */
    static async findPostsPageNumber(blogUrl: string, pageSize: number) {
        const { pageList } = await this.getBlogItemPagination(pageSize)
        // 探す。index 0 なので、+1 する
        const index = pageList
            .map((blogPage, index) => ({ blogPage, index }))
            .find((pair) => pair.blogPage.some((blog) => blog.link === blogUrl))
            ?.index ?? 0
        return index + 1
    }

    /**
     * 関連する記事を取得する
     * タグを基準に、新しい順で。
     * 
     * @param excludeUrl 除外する URL。自分のこと。
     * @param tagNameList タグの配列
     * @param maxSize 最大件数
     * @returns BlogItem[]
     */
    static async findRelatedBlogItemList(excludeUrl: string, tagNameList: string[], maxSize: number) {
        const blogList = await this.getBlogItemList()
        // 関連しているかの判断は、引数に渡したタグが、何個一致しているか
        // 記事は新しい順
        const relatedBlogItemList = blogList
            // タグ無いとかは弾いておく
            .filter((blogItem) => blogItem.link !== excludeUrl && blogItem.tags.length !== 0)
            // 関係ない記事が出そうなので、2つ以上一致しているとき
            // 一旦件数と Pair する
            .map((blogItem) => {
                const containsTagCount = blogItem.tags.filter((tagName) => tagNameList.includes(tagName)).length
                return { containsTagCount, blogItem }
            })
            .filter((pair) => 2 <= pair.containsTagCount)
            // 一致している順
            .sort((a, b) => b.containsTagCount - a.containsTagCount)
            // 返すときは BlogItem[] に戻す
            .map((pair) => pair.blogItem)
            .splice(0, maxSize)
        return relatedBlogItemList
    }

    /**
     * 指定した記事の前後の記事を取得する
     * 次・前の記事のリンクを置く用
     * 
     * @param blogUrl 指定した記事
     * @returns PrevNextBlogItemData
     */
    static async getPrevNextBlogItem(blogUrl: string) {
        const blogList = await this.getBlogItemList()
        const currentIndex = blogList.findIndex((blogItem) => blogItem.link === blogUrl)
        const result: PrevNextBlogItemData = {
            next: blogList?.[currentIndex - 1],
            prev: blogList?.[currentIndex + 1]
        }
        return result
    }

    /**
     * 指定された数ごとに区切った配列にする。chunk
     * 
     * @param origin 区切りたい配列
     * @param size 区切る数
     * @returns [ [T,T,T] [T,T] ]
     */
    private static chunkedPage<T>(origin: T[], size: number) {
        return origin
            .map((_, i) => i % size === 0 ? origin.slice(i, i + size) : null)
            .filter((nullabeList) => nullabeList !== null)
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
                description: data.description,
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