import { Metadata } from "next";
import UrlTool from "../../../../src/UrlTool";
import ContentFolderManager from "../../../../src/ContentFolderManager";
import ClientTagListPage from "./ClientTagListPage";

/** 動的ルーティング */
type PageProps = {
    params: { tag: string }
}

/** head に値を入れる */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: `タグ名:${params.tag} - たくさんの自由帳`,
        alternates: {
            // 正規URL。 送信された URL が正規 URL として選択されていません 対策
            canonical: `${UrlTool.BASE_URL}/${params.tag}/`
        },
    }
}

/** タグがついてる記事一覧ページ */
export default async function TagListPage({ params }: PageProps) {
    // ページネーションは後で
    const tagFilterBlogList = await ContentFolderManager.getTagFilterBlogItem(params.tag)

    return <ClientTagListPage blogList={tagFilterBlogList.result} tagName={params.tag} totalItemCount={tagFilterBlogList.totalCount} />
}

/** 
 * タグの数だけタグのページを作る
 * 
 * 静的書き出し時に呼ばれる
 */
export async function generateStaticParams() {
    const tagNameList = await ContentFolderManager.getAllTagDataList()
    return tagNameList.map((name) => ({ params: { tag: name.name } }))
}
