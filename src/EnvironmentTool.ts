/*
 * 環境変数とか。 .env ファイル参照
 * 直接 proces.env... を見に行くのは良くないかなと思ってクラスにしてます
 */
class EnvironmentTool {

    /** 環境変数からURLを取得する */
    static BASE_URL = process.env.SITE_BASE_URL!

    /** サイト名 */
    static SITE_NAME = process.env.SITE_NAME!

    /** GitHub リポジトリのURL */
    static REPOSITORY_URL = process.env.GITHUB_REPOSITORY_URL!

    /** Google アナリティクス (GA4) の 測定ID */
    static GA_TRACKING_ID = process.env.GA_TRACKING_ID!

    /** Google Search Console の所有権確認のための HTML タグの content の値 */
    static GOOGLE_SEARCH_CONSOLE = process.env.GOOGLE_SEARCH_CONSOLE

    /** 検索 API URL。省略したら undefined */
    static SEARCH_API_URL = process.env.SEARCH_API_URL

    /** 検索結果に乗らないように noindex する場合は true */
    static NO_INDEX_MODE = process.env.NO_INDEX_MODE === 'true'

    /** OGP 画像を無効にする場合は true */
    static DISABLE_OGP_IMAGE = process.env.DISABLE_OGP_IMAGE === 'true'

}

export default EnvironmentTool