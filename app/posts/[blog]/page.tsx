import { Metadata } from "next";
import ContentFolderManager from "../../../src/ContentFolderManager";
import ClientBlogDetailPage from "./ClientBlogDetailPage";
import UrlTool from "../../../src/UrlTool";

/** 動的ルーティング */
type PageProps = {
    params: { blog: string }
}

/** head に値を入れる */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)
    const ogpTitle = `${markdownData.title} - たくさんの自由帳`
    const ogpUrl = `${UrlTool.BASE_URL}${markdownData.link}`

    return {
        title: ogpTitle,
        alternates: {
            canonical: ogpUrl
        },
        openGraph: {
            title: ogpTitle,
            url: ogpUrl
        }
    }
}

/** 記事本文 */
export default async function BlogDetailPage({ params }: PageProps) {
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)

    return <ClientBlogDetailPage markdownData={markdownData} />
}