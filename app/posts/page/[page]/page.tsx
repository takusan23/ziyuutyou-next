import { Metadata } from "next"
import ContentFolderManager from "../../../../src/ContentFolderManager"
import EnvironmentTool from "../../../../src/EnvironmentTool"
import NextLinkButton from "../../../../components/NextLinkButton"
import Button from "../../../../components/Button"
import RoundedCornerList from "../../../../components/RoundedCornerList"
import BlogListItem from "../../../../components/BlogListItem"

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
    const params = await props.params;
    // posts/page/<ここ> を取得
    const pageId = Number(params.page)
    // 記事一覧を取得する。async なので待つ。-1してるのは1ページ目はskip:0にしたいため
    const blogListResult = await ContentFolderManager.getBlogItemList(BLOG_SIZE_LIMIT, BLOG_SIZE_LIMIT * (pageId - 1))
    const blogList = blogListResult.result
    const totalCount = blogListResult.totalCount
    // 次のページ、前のページボタン
    const nextPageId = ((BLOG_SIZE_LIMIT * pageId) <= totalCount) ? pageId + 1 : null
    const prevPageId = (pageId > 1) ? pageId - 1 : null

    return (
        <div className="max-w-6xl m-auto space-y-4 flex flex-col">

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

            {/* ページネーション */}
            <div className="flex flex-row py-4 items-center justify-center space-x-4">
                {
                    // 前のページボタンを出すか。
                    // 無い場合は Disabled なボタンを出す
                    prevPageId ? <NextLinkButton
                        variant="contained"
                        href={`/posts/page/${prevPageId}/`}
                        text="前のページ"
                    /> : <Button
                        isDisabled
                        text="ここだよ"
                    />
                }

                <Button
                    variant="outlined"
                    text={pageId.toString()} />

                {
                    // 次のページを出すか。
                    nextPageId ? <NextLinkButton
                        variant="contained"
                        href={`/posts/page/${pageId + 1}/`}
                        text="次のページ"
                    /> : <Button
                        isDisabled
                        text="追いついた...!?"
                    />
                }
            </div>
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
    const nameList = await ContentFolderManager.getBlogNameList()
    const totalCount = nameList.length
    // 割り算をして必要な数用意する
    const requirePageCount = (totalCount / BLOG_SIZE_LIMIT) + 1 // あまりのために +1
    // 必要なURLを作成
    // 配列を指定数nullで埋めてmapする
    const pathIdList = new Array(Math.floor(requirePageCount))
        .fill(null)
        .map((_, index) => ({ page: (index + 1).toString() })) // 1ページ目から開始なので
    return pathIdList
}