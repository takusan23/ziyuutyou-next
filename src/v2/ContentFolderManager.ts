import path from "path"
import fs from "fs/promises"
import MarkdownParser from "../MarkdownParser"
import MarkdownData from "../data/MarkdownData"
import BlogItem from "../data/BlogItem"
import BlogItemResult from "../data/BlogItemResult"
import TagData from "../data/TagData"

/**
 * content/posts フォルダにあるマークダウンファイルを取得したり、HTML パース結果を返すやつ。
 * この関数は静的書き出し（意味深）時に呼ばれる。ブラウザ側では利用できず、Node.js 側でのみ利用できます。
 */
class ContentFolderManager {

    /** マークダウンパース結果を共用するため、シングルトンにする */
    private static _instance: ContentFolderManager

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

    /** マークダウンのパース結果 */
    private markdownParseList: Map<string, MarkdownData> = new Map()

    /**
     * ContentFolderManager を返します。
     * マークダウンのパース結果を共用するため、シングルトンになってます。
     * 
     * @returns ContentFolderManager
     */
    static getInstance() {
        // Next.js はシングルトンでインスタンスを共有しようとしても、ホットリードでインスタンスが再生成される？
        // globalThis に入れることで回避できるけど、そもそも Next.js の cache() 周りを使うべきな気がした。。。
        if (process.env.NODE_ENV === 'development') {
            globalThis['_ContentFolderManager'] = globalThis['_ContentFolderManager'] ?? new ContentFolderManager()
            return globalThis['_ContentFolderManager'] as ContentFolderManager
        } else {
            ContentFolderManager._instance = ContentFolderManager._instance ?? new ContentFolderManager()
            return ContentFolderManager._instance
        }
    }

    // シングルトンなので一回だけしかコンストラクタ呼ばれない
    private constructor() {
        // マークダウンファイルの変更を追跡して、キャッシュしているマークダウンパース結果を削除する
        // どうやら fs.watch、複数回同じイベントが来るらしく、その都度パースすると負荷かかりそうで、必要になったらパースするで。
        (async () => {
            const postsWatcher = fs.watch(ContentFolderManager.POSTS_FOLDER_PATH)
            for await (const result of postsWatcher) {
                if (result.eventType === 'change' && result.filename) {
                    console.log(`[/posts change] ${result.filename}`)
                    this.deleteCache(path.join(ContentFolderManager.POSTS_FOLDER_PATH, result.filename))
                }
            }
        })();
        (async () => {
            const pagesWatcher = fs.watch(ContentFolderManager.PAGES_FOLDER_PATH)
            for await (const result of pagesWatcher) {
                if (result.eventType === 'change' && result.filename) {
                    console.log(`[/pages change] ${result.filename}`)
                    this.deleteCache(path.join(ContentFolderManager.PAGES_FOLDER_PATH, result.filename))
                }
            }
        })();
    }

    /**
     * 書き出す必要のある固定ページのファイル名配列を返す
     * 
     * @returns ファイル名一覧
     */
    async getPageNameList() {
        return this.getFileNameList(ContentFolderManager.PAGES_FOLDER_PATH)
    }

    /**
     * 書き出す必要のある記事一覧のファイル名配列を返す
     * 
     * @returns ファイル名一覧
     */
    async getBlogNameList() {
        return this.getFileNameList(ContentFolderManager.POSTS_FOLDER_PATH)
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
    async getBlogItemList(limit: number = 10, skip: number) {
        // content/posts の中身を読み出す
        const blogList = await this.getItemList(ContentFolderManager.POSTS_FOLDER_PATH, ContentFolderManager.POSTS_BASE_URL)
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
    async getBlogItem(fileName: string) {
        // 拡張子！！！！
        const filePath = path.join(ContentFolderManager.POSTS_FOLDER_PATH, `${fileName}.md`)
        return this.getMarkdownData(filePath, ContentFolderManager.POSTS_BASE_URL)
    }

    /**
     * 固定ページのMarkdownを読み込んで返す
     * 
     * @param fileName ファイル名
     * @returns パース結果
     */
    async getPageItem(fileName: string) {
        // 拡張子！！！！
        const filePath = path.join(ContentFolderManager.PAGES_FOLDER_PATH, `${fileName}.md`)
        return this.getMarkdownData(filePath, ContentFolderManager.PAGES_BASE_URL)
    }

    /**
     * 指定したタグが含まれた記事一覧配列を返す。
     * 
     * @param tagName タグ名
     * @returns 含まれている記事一覧
     */
    async getTagFilterBlogItem(tagName: string) {
        // とりあえず全件取得
        const blogList = await this.getItemList(ContentFolderManager.POSTS_FOLDER_PATH, ContentFolderManager.POSTS_BASE_URL)
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
    async getAllTagDataList() {
        const blogList = await this.getItemList(ContentFolderManager.POSTS_FOLDER_PATH, ContentFolderManager.POSTS_BASE_URL)
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
     * 既にマークダウンのパース結果がある場合は返す。
     * ない場合は undefined。
     * 
     * @param filePath ファイルパス
     * @return MarkdownData。まだ変換したことがなければ undefined。
     */
    private getCacheOrUndefined(filePath: string) {
        return this.markdownParseList.get(filePath)
    }

    /**
     * マークダウンのパース結果を追加する
     * 
     * @param filePath ファイルパス
     * @param markdownData マークダウンパース結果
     */
    private putCache(filePath: string, markdownData: MarkdownData) {
        this.markdownParseList.set(filePath, markdownData)
    }

    /**
     * マークダウンのパース結果を削除する
     * 
     * @param filePath ファイルパス
     */
    private deleteCache(filePath: string) {
        this.markdownParseList.delete(filePath)
    }

    /**
     * 引数のフォルダパスの中身をファイル名配列として返す
     * 
     * @param folderPath フォルダのパス
     * @returns フォルダの中にあるファイルの名前一覧
     */
    private async getFileNameList(folderPath: string) {
        return (await fs.readdir(folderPath)).map(name => path.parse(name).name)
    }

    /**
     * 指定パスのフォルダに入ってる記事一覧を返す
     * 
     * @param folderPath フォルダのパス
     * @param baseUrl /posts とか /pages とか
     * @returns 記事一覧 BlogItem[]
     */
    private async getItemList(folderPath: string, baseUrl: string) {
        // content/posts の中身を読み出す
        const postFileList = await fs.readdir(folderPath)
        // Markdownパーサーへかける
        const markdownParsePromiseList = postFileList
            .map(fileName => path.join(folderPath, fileName))
            .map(filePath => this.getMarkdownData(filePath, baseUrl))
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
     * 引数に渡したマークダウンファイルをパースする。
     * 一度パースしたことがあればそれを返す。
     * 
     * @param filePath ファイルパス
     * @param baseUrl ベースの URL。
     * @returns MarkdownData
     */
    private async getMarkdownData(filePath: string, baseUrl: string) {
        // キャッシュがあれば優先的に返す
        const cacheOrUndefined = this.getCacheOrUndefined(filePath)
        if (cacheOrUndefined) {
            console.log(`cache hit ${filePath}`)
            return cacheOrUndefined
        }

        // ない場合
        // console.log(`missing cache ${filePath}`)
        const markdownData = await MarkdownParser.parse(filePath, baseUrl)
        this.putCache(filePath, markdownData)
        return markdownData
    }

    /**
     * 配列内から同じやつを消す
     * 
     * @param list 配列
     * @returns かぶりがない配列
     */
    private distinctFromList<T>(list: Array<T>) {
        return Array.from(new Set(list))
    }

}

export default ContentFolderManager