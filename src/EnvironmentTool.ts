/*
 * 環境変数とか。 .env ファイル参照
 * 直接 proces.env... を見に行くのは良くないかなと思ってクラスにしてます
 */
class EnvironmentTool {

    /** 環境変数からURLを取得する */
    static BASE_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL!

    /** サイト名 */
    static SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME!

    /** GitHub リポジトリのURL */
    static REPOSITORY_URL = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY_URL!

    /** Google アナリティクス (UA) の 測定ID */
    static UA_TRACKING_ID = process.env.NEXT_PUBLIC_UA_TRACKING_ID!

    /** Google アナリティクス (GA4) の 測定ID */
    static GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID!

    /** Google Search Console の所有権確認のための HTML タグの content の値 */
    static GOOGLE_SEARCH_CONSOLE = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE
}

export default EnvironmentTool