import { Metadata } from "next"
import ContentFolderManager from "../../../../src/ContentFolderManager"
import ClientBlogList from "./ClientBlogList"

/** 一度に取得する件数 */
export const blogLimit = 10

/** 動的ルーティング */
type PageProps = {
    params: { page: string }
}

/** head に値を入れる */
export const metadata: Metadata = {
    title: '記事一覧 - たくさんの自由帳'
}

/** 記事一覧ページ */
export default async function BlogListPage({ params }: PageProps) {
    // posts/page/<ここ> を取得
    const pageId = Number(params.page)
    // 記事一覧を取得する。async なので待つ。-1してるのは1ページ目はskip:0にしたいため
    const blogListResult = await ContentFolderManager.getBlogItemList(blogLimit, blogLimit * (pageId - 1))
    const blogList = blogListResult.result
    const totalCount = blogListResult.totalCount
    // 次のページ、前のページボタン
    const nextPageId = ((blogLimit * pageId) <= totalCount) ? pageId + 1 : null
    const prevPageId = (pageId > 1) ? pageId - 1 : null

    return <ClientBlogList blogList={blogList} pageId={pageId} nextPageId={nextPageId} prevPageId={prevPageId} />
}