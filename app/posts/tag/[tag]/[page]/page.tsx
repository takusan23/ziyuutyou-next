import { Metadata } from "next"
import EnvironmentTool from "../../../../../src/EnvironmentTool"
import ContentFolderManager from "../../../../../src/ContentFolderManager"
import RoundedCornerList from "../../../../../components/RoundedCornerList"
import BlogListItem from "../../../../../components/BlogListItem"
import PageButtonGruop from "../../../../../components/PageButtonGroup"

/** 一度に取得する件数 */
const BLOG_SIZE_LIMIT = 10

/** 動的ルーティング */
type PageProps = {
    params: Promise<{ tag: string, page: string }>
}

/** head に値を入れる */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const unEscapeText = decodeURIComponent(params.tag)
    return {
        title: `タグ名:${unEscapeText} - ${EnvironmentTool.SITE_NAME}`,
        alternates: {
            // 正規URL。 送信された URL が正規 URL として選択されていません 対策
            canonical: `${EnvironmentTool.BASE_URL}/${unEscapeText}/`
        }
    }
}

/** タグがついてる記事一覧ページ */
export default async function TagListPage(props: PageProps) {
    const params = await props.params
    // /posts/tag/{tagName}/{pageParam} を取得
    const tagNameParam = params.tag
    const pageParam = Number(params.page)
    // パーセントエンコーディングされているため戻す
    const unEscapeText = decodeURIComponent(params.tag)
    const { totalCount, pageList, pageNumberList } = await ContentFolderManager.getTagFilterBlogItemList(unEscapeText, BLOG_SIZE_LIMIT)
    // -1 してるのは 1 ページ目は skip=0 にしたいため
    const blogList = pageList[pageParam - 1]

    return (
        <>
            <div className="max-w-6xl m-auto flex flex-col space-y-4">

                <div>
                    <h1 className="text-content-primary-light dark:text-content-primary-dark text-3xl">
                        {unEscapeText}
                    </h1>
                    <h3 className="text-content-primary-light dark:text-content-primary-dark text-lg">
                        {`${totalCount} 件`}
                    </h3>
                </div>

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
                    currentPage={pageParam}
                    pageNumberList={pageNumberList}
                    baseUrl={`/posts/tag/${tagNameParam}/`} />
            </div>
        </>
    )
}

/** 
 * タグの数だけタグのページを作る
 * 
 * 静的書き出し時に呼ばれる
 */
export async function generateStaticParams() {
    const dynamicRoutePathList: {}[] = []

    // タグの数だけ、ページングできるページを
    const tagNameList = await ContentFolderManager.getAllTagDataList()
    for (const tagName of tagNameList) {
        const tagFilterdResult = await ContentFolderManager.getTagFilterBlogItemList(tagName.name, BLOG_SIZE_LIMIT)
        // 1 ページ目から開始なので
        tagFilterdResult.pageList.forEach((_, pageIndex) => {
            dynamicRoutePathList.push({
                tag: tagName.name,
                page: (pageIndex + 1).toString()
            })
        })
    }

    return dynamicRoutePathList
}
