import { MetadataRoute } from "next";
import UrlTool from "../src/UrlTool";
import ContentFolderManager from "../src/ContentFolderManager";

/** サイトマップを生成する。Next.js 単体で作れるようになった。 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const currentTime = new Date()

    // 静的ページ
    const staticPathList: MetadataRoute.Sitemap = [
        {
            url: UrlTool.BASE_URL,
            lastModified: currentTime
        }
    ]

    // ブログ記事と固定ページの名前
    const [blogPathList, pagePathList] = await Promise.all([ContentFolderManager.getBlogNameList(), ContentFolderManager.getPageNameList()])
    const dynamicPathList: MetadataRoute.Sitemap = [...blogPathList, ...pagePathList].map(name => ({
        url: `${UrlTool.BASE_URL}/${name}`,
        lastModified: currentTime
    }))

    return [...staticPathList, ...dynamicPathList]
}