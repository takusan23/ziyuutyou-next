import fs from "fs/promises"
import matter from "gray-matter"
import MarkdownData from "./data/MarkdownData"
import path from "path"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify/lib"
import rehypeSlug from "rehype-slug"
import rehypeParse from "rehype-parse"
import { Content, Element } from "hast"
import TocData from "./data/TocData"
import { toString } from 'mdast-util-to-string'

/**
 * Markdownパーサー
 * 
 *  - gray-matter (Markdown冒頭のメタデータをパースする)
 * 
 * - unified (Markdown / HTML 変換するためのシステム)
 * - remarkParse (Markdownパーサー)
 * - remarkRehype / rehypeStringify (HTML変換)
 * - rehypeRaw (Markdownに埋め込んだHTMLを利用する)
 * - rehypeHighlight (シンタックスハイライト。CSSはHighlight.jsから。_app.tsxで読み込んでる)
 * - remarkGfm (テーブル、打ち消し線、自動リンク機能)
 * - rehypeSlug (HTML生成後に h1, h2 等に id属性 をセットしてくれる。目次からスクロールするため)
 */
class MarkdownParser {

    /** 目次のタグ名 */
    private static HEAD_TAG = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

    /**
     * Markdownのファイルを渡してHTMLに変換する
     * 
     * @param filePath 解析するMarkdownフォルダのファイルパス
     * @param ベースURL。/posts/<ファイル名> とか
     * @returns HTMLとか
     */
    static async parse(filePath: string, baseUrl: string = '/posts') {
        // マークダウン読み出す
        const rawMarkdownText = await fs.readFile(filePath, { encoding: 'utf-8' })
        const textCount = rawMarkdownText.length
        const matterResult = matter(rawMarkdownText)
        // メタデータ
        const title = matterResult.data['title'] as string
        // ライブラリ君が勝手にDateオブジェクトに変換してくれた模様
        const date = matterResult.data['created_at'] as Date
        // 誰もビルドマシンが日本語環境とは言っていない、ので日本語のローカルを指定する（Netlifyでビルドすると外国語環境なので日付がおかしくなる）
        const createdAt = date.toLocaleDateString('ja-JP')
        // datetime 属性に入れるためのやつ、必要かどうかは不明
        const dateTimeAttr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate}`
        const tags = (matterResult.data['tags'] ?? []) as Array<string>
        const fileName = path.parse(filePath).name
        const createdAtUnixTime = date.getTime()
        // マークダウン -> unified -> HTML 
        const remarkParser = await unified()
            .use(remarkParse)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeRaw)
            .use(remarkGfm)
            .use(rehypeStringify)
            .use(rehypeSlug)
            .use(rehypeHighlight, {
                // 利用できない言語の場合はエラー出さずに無視
                ignoreMissing: true
            })
            .process(matterResult.content)
        const markdownToHtml = remarkParser.toString()
        // Markdown から生成した HTML から 目次だけを取り出す
        const tocDataList = this.parseToc(markdownToHtml)
        const data: MarkdownData = {
            title: title,
            createdAt: createdAt,
            createdAtUnixTime: createdAtUnixTime,
            tags: tags,
            html: markdownToHtml,
            link: `${baseUrl}/${fileName}/`,
            fileName: fileName,
            textCount: textCount,
            tocDataList: tocDataList
        }
        return data
    }

    /**
     * HTML を解析して 目次データを作成する
     * 
     * @param html HTML
     * @returns 目次データの配列
     */
    static parseToc(html: string): TocData[] {
        const tocList: Element[] = []
        // HTML を unified を利用し 構文木 に変換する
        const ast = unified()
            .use(rehypeParse)
            .parse(html)
        // 再帰的に呼び出す関数
        const findToc = (children: Content[]) => {
            children
                .filter(element => element.type === 'element')
                // type === element で絞り込んだので cast しても大丈夫、、なはず
                .map(element => element as Element)
                .forEach((element) => {
                    // 目次のみ追加
                    if (this.HEAD_TAG.includes(element.tagName)) {
                        tocList.push(element)
                    }
                    findToc(element.children ?? [])
                })
        }
        findToc(ast.children)
        // 目次データに変換して返す
        const tocDataList: TocData[] = tocList.map((element) => ({
            label: toString(element),
            level: Number(element.tagName.charAt(1)),
            hashTag: `#${element.properties['id']}` // id属性 を取り出し、先頭に#をつける
        }))
        return tocDataList
    }

}

export default MarkdownParser