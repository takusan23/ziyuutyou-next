/** 目次のデータ */
type TocData = {
    /** 目次の名前 */
    label: string,
    /** 目次の階層 h2 なら 2 */
    level: number,
    /** 目次のハッシュタグ */
    hashTag: string,
}

export default TocData