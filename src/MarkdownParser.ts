import fs from "fs"
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
        const rawMarkdownText = await fs.readFileSync(filePath, { encoding: 'utf-8' })
        const matterResult = matter(rawMarkdownText)
        // メタデータ
        const title = matterResult.data['title'] as string
        // ライブラリ君が勝手にDateオブジェクトに変換してくれた模様
        const date = matterResult.data['created_at'] as Date
        const createdAt = date.toLocaleDateString()
        const tags = matterResult.data['tags'] as Array<string>
        const fileName = path.parse(filePath).name
        const createdAtUnixTime = date.getTime()
        // マークダウン -> unified -> HTML 
        const remarkParser = await unified()
            .use(remarkParse)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeRaw)
            .use(remarkGfm)
            .use(rehypeStringify)
            .use(rehypeHighlight)
            .process(matterResult.content)
        const markdownToHtml = remarkParser.toString()
        const data: MarkdownData = {
            title: title,
            createdAt: createdAt,
            createdAtUnixTime: createdAtUnixTime,
            tags: tags,
            html: markdownToHtml,
            link: `${baseUrl}/${fileName}`
        }
        return data
    }

}

export default MarkdownParser