import { MetadataRoute } from "next";
import EnvironmentTool from "../src/EnvironmentTool";
import ContentFolderManager from "../src/ContentFolderManager";

// 静的書き出しなので指定する必要がないはずだが、Next.js 15 から無いとエラーになってしまう
// https://github.com/vercel/next.js/issues/68667
export const dynamic = "force-static"

/**
 * サイトマップを生成する。Next.js 単体で作れるようになった。
 * Trailing Slash が有効なので最後にスラッシュ入れました。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    // 静的ページ
    const staticPathList: MetadataRoute.Sitemap = [
        {
            url: `${EnvironmentTool.BASE_URL}/`
        }
    ]

    // ブログ記事
    const blogNameList = await ContentFolderManager.getBlogNameList()
    const blogItemList = await Promise.all(blogNameList.map((name) => ContentFolderManager.getBlogItem(name)))
    const blogPathList = blogItemList.map((markdownData) => (
        {
            url: `${EnvironmentTool.BASE_URL}${markdownData.link}`,
            lastModified: new Date(markdownData.createdAtUnixTime).toISOString()
        }
    ))

    // 固定ページ
    const pageNameList = await ContentFolderManager.getPageNameList()
    const pageItemList = await Promise.all(pageNameList.map((name) => ContentFolderManager.getPageItem(name)))
    const pagePathList = pageItemList.map((markdownData) => (
        {
            url: `${EnvironmentTool.BASE_URL}${markdownData.link}`,
            lastModified: new Date(markdownData.createdAtUnixTime).toISOString()
        }
    ))

    return [...staticPathList, ...blogPathList, ...pagePathList]
}