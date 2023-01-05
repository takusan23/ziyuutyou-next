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
        const data: MarkdownData = {
            title: title,
            createdAt: createdAt,
            createdAtUnixTime: createdAtUnixTime,
            tags: tags,
            html: markdownToHtml,
            link: `${baseUrl}/${fileName}/`,
            fileName: fileName,
            textCount: textCount
        }
        return data
    }

}

export default MarkdownParser