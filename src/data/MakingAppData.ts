/** content/json/making.app で使う作ったアプリの詳細データ */
export type MakingAppDetailData = {
    /** アプリ名 */
    name: string,
    /** 説明 */
    description: string,
    /** リンク */
    link: string,
    /** ソースコードのリンク */
    github: string,
}

/** 各プラットフォームのアプリ配列を入れるデータ */
export type MakingAppData = {
    /** プラットフォーム。AndroidとかWebとか */
    platfromName: string,
    /** アプリ配列 */
    appList: Array<MakingAppDetailData>
}