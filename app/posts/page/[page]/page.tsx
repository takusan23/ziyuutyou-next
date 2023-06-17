import { Metadata } from "next"
import ContentFolderManager from "../../../../src/ContentFolderManager"
import ClientBlogList from "./ClientBlogList"

/** 一度に取得する件数 */
export const BLOG_SIZE_LIMIT = 10

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
    const blogListResult = await ContentFolderManager.getBlogItemList(BLOG_SIZE_LIMIT, BLOG_SIZE_LIMIT * (pageId - 1))
    const blogList = blogListResult.result
    const totalCount = blogListResult.totalCount
    // 次のページ、前のページボタン
    const nextPageId = ((BLOG_SIZE_LIMIT * pageId) <= totalCount) ? pageId + 1 : null
    const prevPageId = (pageId > 1) ? pageId - 1 : null

    return <ClientBlogList blogList={blogList} pageId={pageId} nextPageId={nextPageId} prevPageId={prevPageId} />
}

/**
 * こっちは生成するHTMLのパスを返す関数。
 * 
 * これも静的書き出しのときに呼ばれ、クライアント側で実行されません。
 * 
 * ブログ一覧では次のページを生成する必要があるため、必要な次のページの分だけURLを作って返す必要があります。(実際は[page]の部分ですが)
 */
export async function generateStaticParams() {
    // async なので待つ。合計数がほしいので名前だけの配列で
    const nameList = await ContentFolderManager.getBlogNameList()
    const totalCount = nameList.length
    // 割り算をして必要な数用意する
    const requirePageCount = (totalCount / BLOG_SIZE_LIMIT) + 1 // あまりのために +1
    // 必要なURLを作成
    const pathIdList: PageProps[] = []
    for (let i = 0; i < requirePageCount; i++) {
        // この場合はキーが page になるけどこれはファイル名によって変わる（[page].tsxだから）
        pathIdList.push({ params: { page: i.toString() } })
    }
    return pathIdList
}