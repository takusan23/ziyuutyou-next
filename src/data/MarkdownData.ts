/** Markdownを解析した結果を入れるデータクラスみたいなのを作りたかった */
type MarkdownData = {
    /** タイトル */
    title: string,
    /** 作成日 */
    createdAt: string,
    /** 作成日、UnixTime版。並び替えで使う */
    createdAtUnixTime: number,
    /** タグ */
    tags: Array<string>,
    /** 本文 */
    html: string,
    /** ファイル名。URLの一部 */
    link: string,
}

export default MarkdownData