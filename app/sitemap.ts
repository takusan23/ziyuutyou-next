import { MetadataRoute } from "next";
import EnvironmentTool from "../src/EnvironmentTool";
import ContentFolderManager from "../src/ContentFolderManager";

/**
 * サイトマップを生成する。Next.js 単体で作れるようになった。
 * Trailing Slash が有効なので最後にスラッシュ入れました。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const currentTime = new Date()

    // 静的ページ
    const staticPathList: MetadataRoute.Sitemap = [
        {
            url: `${EnvironmentTool.BASE_URL}/`,
            lastModified: currentTime
        }
    ]

    // ブログ記事
    const blogPathList = (await ContentFolderManager.getBlogNameList())
        .map(name => ({
            url: `${EnvironmentTool.BASE_URL}/posts/${name}/`,
            lastModified: currentTime
        }))

    // 固定ページ
    const pagePathList = (await ContentFolderManager.getPageNameList())
        .map(name => ({
            url: `${EnvironmentTool.BASE_URL}/pages/${name}/`,
            lastModified: currentTime
        }))

    return [...staticPathList, ...blogPathList, ...pagePathList]
}