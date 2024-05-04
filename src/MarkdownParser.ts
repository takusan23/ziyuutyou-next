import fs from "fs/promises"
import matter from "gray-matter"
import MarkdownData from "./data/MarkdownData"
import path from "path"
import rehypePrettyCode from "rehype-pretty-code"
import transformShikiCodeBlockCopyButton from "./transformShikiCodeBlockCopyButton"
import remarkGfm from "remark-gfm"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import rehypeSlug from "rehype-slug"
import TocData from "./data/TocData"
import { JSDOM } from "jsdom"

/**
 * Markdownパーサー
 * 
 * - jsdom (HTML生成後、見出し (h1,h2...) を取り出すため利用)
 * 
 * - gray-matter (Markdown冒頭のメタデータをパースする)
 * 
 * - unified (Markdown / HTML 変換するためのシステム)
 * - remarkParse (Markdownパーサー)
 * - remarkRehype / rehypeStringify (HTML変換)
 * - rehypeRaw (Markdownに埋め込んだHTMLを利用する)
 * - rehypePrettyCode (シンタックスハイライト)
 * - remarkGfm (テーブル、打ち消し線、自動リンク機能)
 * - rehypeSlug (HTML生成後に h1, h2 等に id属性 をセットしてくれる。目次からスクロールするため)
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
        // 文字数カウント。
        // 正規表現でコードブロックを取り出して、その分の文字数を消す
        const markdownCodeBlockAllExtract = Array.from(rawMarkdownText.matchAll(this.REGEX_MARKDOWN_CODE_BLOCK), (m) => m[0])
        const markdownCodeBlockLength = markdownCodeBlockAllExtract.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0,)
        const textCount = rawMarkdownText.length - markdownCodeBlockLength
        // メタデータ
        const matterResult = matter(rawMarkdownText)
        const title = matterResult.data['title'] as string
        // ライブラリ君が勝手にDateオブジェクトに変換してくれた模様
        const date = matterResult.data['created_at'] as Date
        // 誰もビルドマシンが日本語環境とは言っていない、ので日本語のローカルを指定する（Netlifyでビルドすると外国語環境なので日付がおかしくなる）
        const createdAt = date.toLocaleDateString('ja-JP')
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
            .use(rehypePrettyCode, {
                theme: "dark-plus",
                transformers: [
                    // コピーボタンを差し込む
                    transformShikiCodeBlockCopyButton()
                ]
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
     * HTML を解析して 目次データを作成する。結構時間がかかる。
     * 
     * @param html HTML
     * @returns 目次データの配列
     */
    static parseToc(html: string): TocData[] {
        // HTML パーサー ライブラリを利用して h1 , h2 ... を取得する
        // この関数は ブラウザ ではなく Node.js から呼び出されるため、document は使えない。
        const window = (new JSDOM(html)).window
        const document = window.document
        const tocElementList = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        // 目次データに変換して返す
        const tocDataList: TocData[] = Array.from(tocElementList)
            .map(element => {
                if (element.textContent) {
                    return {
                        label: element.textContent,
                        level: Number(element.tagName.charAt(1)), // h1 の 1 だけ取り出し数値型へ
                        hashTag: `#${element.getAttribute('id')}` // id属性 を取り出し、先頭に#をつける
                    }
                } else {
                    return null
                }
            })
            // null を配列から消す技です
            .flatMap(tocDataOrNull => tocDataOrNull ? [tocDataOrNull] : [])
        window.close()
        return tocDataList
    }

}

export default MarkdownParser