import { Metadata } from "next"
import ContentFolderManager from "../../../../src/ContentFolderManager"
import EnvironmentTool from "../../../../src/EnvironmentTool"
import RoundedCornerList from "../../../../components/RoundedCornerList"
import BlogListItem from "../../../../components/BlogListItem"
import PageButtonGruop from "../../../../components/PageButtonGroup"
import Title from "../../../../components/Title"

/** 一度に取得する件数 */
const BLOG_SIZE_LIMIT = 10

/** 動的ルーティング */
type PageProps = {
    params: Promise<{ page: string }>
}

/** head に値を入れる */
export const metadata: Metadata = {
    title: `記事一覧 - ${EnvironmentTool.SITE_NAME}`
}

/** 記事一覧ページ */
export default async function BlogListPage(props: PageProps) {
    const params = await props.params
    // posts/page/{ここ} を取得
    const pageParam = Number(params.page)
    // 記事一覧を取得する。async なので待つ
    const { pageList, pageNumberList } = await ContentFolderManager.getBlogItemList(BLOG_SIZE_LIMIT)
    // -1 してるのは 1 ページ目は skip=0 にしたいため
    const blogList = pageList[pageParam - 1]

    return (
        <div className="max-w-6xl m-auto space-y-4 flex flex-col">

            <Title title="記事一覧" />

            {/* 記事一覧 */}
            <RoundedCornerList
                list={blogList}
                content={(className, item) => (
                    <div
                        className={`bg-container-primary-light dark:bg-container-primary-dark ${className}`}
                        key={item.link}
                    >
                        <BlogListItem blogItem={item} />
                    </div>
                )}
            />

            <PageButtonGruop
                baseUrl="/posts/page/"
                currentPage={pageParam}
                pageNumberList={pageNumberList} />
        </div>
    )
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
    const { pageNumberList } = await ContentFolderManager.getBlogNamePagination(BLOG_SIZE_LIMIT)
    return pageNumberList.map((pageNumber) => ({ page: pageNumber.toString() }))
}