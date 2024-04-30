/** カテゴリに属するアイテム一覧の詳細 */
export type PortfolioDetailData = {
    /** 名前 */
    name: string
    /** 説明 */
    description: string
    /** リンク */
    link: string
    /** ソースコードのリンク（あれば） */
    github?: string
    /** 画像リンク（あれば） */
    image?: string
}

/** ポートフォリオの各カテゴリ別データ */
export type PortfolioData = {
    /** カテゴリ名。Android とか Web とか。 */
    categoryName: string
    /** カテゴリに属するアイテム一覧 */
    categoryItemList: PortfolioDetailData[]
}