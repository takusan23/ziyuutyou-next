import MarkdownParser from "./MarkdownParser"
import LinkCardData from "./data/LinkCardData"

class LinkCardTool {

    /**
     * リンクカードの情報を取得する
     * OGP がサイトに実装されているか、リクエストして確認する
     * CORS の関係で、ブラウザではなく Node.js でリクエストする必要がある
     * 
     * @param url リンクカードを取得する URL
     * @return LinkCardData
     */
    static async getLinkCardData(url: string) {
        // 相対 URL の解決
        const urlObject = new URL(url)
        const baseUrl = `${urlObject.protocol}//${urlObject.host}/`

        let html: string
        try {
            html = await fetch(url, { cache: 'force-cache', next: { revalidate: false } }).then((res) => res.text())
        } catch (e) {
            // 失敗したらすべての値が undefined になるよう
            return {}
        }

        // 王道は jsdom だと思うが、unified の HTML パーサーを持っているので
        const hast = MarkdownParser.parseHtmlAstFromHtmlString(html)
        const metaElementList = hast
            .filter((element) => element.type === "element")
            .filter((element) => element.tagName === "meta")

        // それぞれ取り出す
        const ogTitle = metaElementList.find((element) => element.properties['property'] === 'og:title')?.properties['content']?.toString()
        const ogDescription = metaElementList.find((element) => element.properties['property'] === 'og:description')?.properties['content']?.toString()

        // img と url は相対 URL かも、、、なので絶対 URL に変換
        let ogUrl = metaElementList.find((element) => element.properties['property'] === 'og:url')?.properties['content']?.toString()
        let ogImage = metaElementList.find((element) => element.properties['property'] === 'og:image')?.properties['content']?.toString()
        if (ogUrl) {
            const ogUrlUrl = new URL(ogUrl, baseUrl)
            ogUrl = ogUrlUrl.href
        }
        if (ogImage) {
            const ogImageUrl = new URL(ogImage, baseUrl)
            ogImage = ogImageUrl.href
        }

        // 存在しないかもなので undefied も許容
        const result: LinkCardData = {
            img: ogImage,
            title: ogTitle,
            description: ogDescription,
            url: ogUrl
        }
        return result
    }
}

export default LinkCardTool