import { Metadata } from "next";
import ContentFolderManager from "../../../src/ContentFolderManager";
import UrlTool from "../../../src/UrlTool";
import ClientPageDetailPage from "./ClientPageDetailPage";

/** 動的ルーティング */
type PageProps = {
    params: { page: string }
}

/** head に値を入れる */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const markdownData = await ContentFolderManager.getPageItem(params.page)
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

/** 固定ページの記事本文 */
export default async function PageDetailPage({ params }: PageProps) {
    const markdownData = await ContentFolderManager.getPageItem(params.page)

    return <ClientPageDetailPage markdownData={markdownData} />
}

/** 生成するページを列挙して返す */
export async function generateStaticParams() {
    const pageNameList = await ContentFolderManager.getPageNameList()
    return pageNameList.map(name => ({ page: name }))
}