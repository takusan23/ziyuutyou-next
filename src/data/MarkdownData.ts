import TocData from "./TocData"

/** Markdownを解析した結果を入れるデータクラスみたいなのを作りたかった */
type MarkdownData = {
    /** タイトル */
    title: string
    /** 作成日 */
    createdAt: string
    /** 作成日、UnixTime版 */
    createdAtUnixTime: number
    /** タグ */
    tags: string[]
    /** 本文 */
    html: string
    /** URLの一部 */
    link: string
    /** ファイル名 */
    fileName: string
    /** マークダウンの時点での文字数 */
    textCount: number
    /** 目次の配列 */
    tocDataList: TocData[]
}

export default MarkdownData