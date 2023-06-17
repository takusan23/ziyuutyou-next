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
    // サーバー側でロードする
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)
    // クライアントコンポーネント
    return <ClientBlogDetailPage markdownData={markdownData} />
}

/**
 * ここで生成するページを列挙して返す。（実際にはパスの一部）
 * 
 * /posts/<ここ> ←ここの部分の名前を渡して生成すべきページを全部列挙して返してる
 * 
 * これも上記同様クライアント側では呼ばれない。
 */
export async function generateStaticParams() {
    const fileNameList = await ContentFolderManager.getBlogNameList()
    // この場合はキーが blog になるけどこれはファイル名によって変わる（[page].tsxなら page がキーになる）
    return fileNameList.map((name) => ({ blog: name }))
}