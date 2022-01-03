import fs from "fs"
import matter from "gray-matter"
import { remark } from "remark"
import remarkHtml from "remark-html"
import MarkdownData from "./data/MarkdownData"
import path from "path"

/**
 * Markdownパーサー
 * 
 * - remark (Markdownパーサー)
 * - remark-html (remarkの結果をhtmlに変換する)
 * - gray-matter (Markdown冒頭のメタデータをパースする)
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
        // マークダウン -> HTML
        const parseContent = await remark()
            .use(remarkHtml)
            .process(matterResult.content)
        const content = parseContent.toString()
        const data: MarkdownData = {
            title: title,
            createdAt: createdAt,
            createdAtUnixTime: createdAtUnixTime,
            tags: tags,
            html: content,
            link: `${baseUrl}/${fileName}`
        }
        return data
    }

}

export default MarkdownParser