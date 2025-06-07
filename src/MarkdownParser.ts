import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import remarkGfm from "remark-gfm"
import rehypeParse from "rehype-parse"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import type { Root, RootContent, Element } from "hast"
import { toString } from "hast-util-to-string"
import GithubSlugger from "github-slugger"
import { visit } from "unist-util-visit"
import MarkdownData from "./data/MarkdownData"
import HeadingData from "./data/HeadingData"

/**
 * Markdown パーサー
 * 
 * - gray-matter (Markdown冒頭のメタデータをパースする)
 * - unified (Markdown / HTML 変換するためのシステム)
 * - remarkParse (Markdownパーサー)
 * - remarkRehype / rehypeStringify (HTML変換)
 * - rehypeRaw (Markdownに埋め込んだHTMLを利用する)
 * - remarkGfm (テーブル、打ち消し線、自動リンク機能)
 * 
 * 使い方としては、
 * {@see parse}で、Markdown の本文とタグ等を取得。
 * <MarkdownRender /> へ Markdown 本文を渡して描画。
 * 見出しとかは {@see findAllHeading} や {@see createHeadingIdAttribute} を使う。
 */
class MarkdownParser {

    /**
     * Markdown のコードブロックに一致する正規表現。正規表現リテラル。
     * ```任意のプログラミング言語名 から始まって、``` で終わる文字列に一致する。
     * 一応言語名付けないと動かないようにしてみた。（``` から ``` だと閉じ忘れたときにおかしくなりそう）
     */
    private static REGEX_MARKDOWN_CODE_BLOCK = /```([\S])([\s\S\n]*?)```/g

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
        const fileName = path.parse(filePath).name
        // メタデータ
        const matterResult = matter(rawMarkdownText)
        // メタデータ抜き。本文
        const markdownContent = matterResult.content
        const title = matterResult.data['title'] as string
        // ライブラリ君が勝手にDateオブジェクトに変換してくれた模様
        const date = matterResult.data['created_at'] as Date
        // 誰もビルドマシンが日本語環境とは言っていない、ので日本語のローカルを指定する（Netlifyでビルドすると外国語環境なので日付がおかしくなる）
        const createdAt = date.toLocaleDateString('ja-JP')
        const tags = (matterResult.data['tags'] ?? []) as string[]
        const createdAtUnixTime = date.getTime()
        // 文字数カウント。
        // 正規表現でコードブロックを取り出して、その分の文字数を消す
        const markdownCodeBlockAllExtract = Array.from(markdownContent.matchAll(this.REGEX_MARKDOWN_CODE_BLOCK), (m) => m[0])
        const markdownCodeBlockLength = markdownCodeBlockAllExtract.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0)
        const textCount = markdownContent.length - markdownCodeBlockLength
        const data: MarkdownData = {
            title: title,
            createdAt: createdAt,
            createdAtUnixTime: createdAtUnixTime,
            tags: tags,
            markdown: markdownContent,
            description: markdownContent.substring(0, 100),
            link: `${baseUrl}/${fileName}/`,
            fileName: fileName,
            textCount: textCount
        }
        return data
    }

    /**
     * タグを探す
     * ネストされていれば再帰的に探す
     * 
     * @param tagName タグ名。h1 など
     * @return Element[]
     */
    static findNestedElement(element: Root | Element, tagName: string[]) {
        const elementList: Element[] = []
        visit(element, (node) => {
            if (node.type === "element" && tagName.includes(node.tagName)) {
                elementList.push(node)
            }
        })
        return elementList
    }

    /**
     * Markdown から unified の HTML AST を取得する
     * 
     * @param markdown Markdown 本文
     * @returns hast (unified HTML AST)
     */
    static async parseMarkdownToHtmlAst(markdown: string) {
        const remarkProcessor = unified()
            .use(remarkParse)
            .use(remarkGfm)
        const rephypeProsessor = unified()
            .use(remarkRehype, { allowDangerousHtml: true })
        // Markdown AST (mdast)
        const mdast = remarkProcessor.parse(markdown)
        // mdast -> HTML AST (hast)
        const hast = await rephypeProsessor.run(mdast)
        return hast
    }

    /**
     * 文字列の HTML から unified HTML AST を作成する
     * 
     * @param html HTML
     * @returns 要素の配列
     */
    static parseHtmlAstFromHtmlString(html: string) {
        // fragment: true で html/head/body が生成されないように
        const rephypeProsessor = unified()
            .use(rehypeParse, { fragment: true })
        const hast = rephypeProsessor.parse(html)
        return hast.children
    }

    /**
     * unified の HTML AST から html を作成する
     * 
     * @param ast {@see parseMarkdownToHtmlAst} の children
     * @returns HTML
     */
    static async buildHtmlFromHtmlAst(hast: RootContent) {
        const hastProcessor = unified()
            .use(rehypeRaw)
        const htmlProcessor = unified()
            .use(rehypeStringify)
        const fixHast = await hastProcessor.run({ type: "root", children: [hast] })
        const html = htmlProcessor.stringify(fixHast)
        return html.toString()
    }

    /**
     * h1,h2 等の名前と、付与する id 属性を返す
     * 見出しまでスクロール出来るように
     * 
     * @param hast {@see findAllHeading}の各あたい
     */
    static createHeadingData(hast: Element) {
        const headingData: HeadingData = {
            id: (new GithubSlugger()).slug(toString(hast)),
            name: toString(hast)
        }
        return headingData
    }
}

export default MarkdownParser