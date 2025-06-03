import { Metadata } from "next"
import EnvironmentTool from "../../../../src/EnvironmentTool"
import ContentFolderManager from "../../../../src/ContentFolderManager"
import RoundedCornerList from "../../../../components/RoundedCornerList"
import BlogListItem from "../../../../components/BlogListItem"

/** 動的ルーティング */
type PageProps = {
    params: Promise<{ tag: string }>
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
    const params = await props.params;
    // パーセントエンコーディングされているため戻す
    const unEscapeText = decodeURIComponent(params.tag)
    // ページネーションは後で
    const tagFilterBlogList = await ContentFolderManager.getTagFilterBlogItem(unEscapeText)

    return (
        <>
            <div className="max-w-6xl m-auto flex flex-col space-y-4">

                <div>
                    <h1 className="text-content-primary-light dark:text-content-primary-dark text-3xl">
                        {unEscapeText}
                    </h1>
                    <h3 className="text-content-primary-light dark:text-content-primary-dark text-lg">
                        {`${tagFilterBlogList.totalCount} 件`}
                    </h3>
                </div>

                <RoundedCornerList
                    list={tagFilterBlogList.result}
                    content={(className, item) => (
                        <div
                            className={`bg-container-primary-light dark:bg-container-primary-dark ${className}`}
                            key={item.link}
                        >
                            <BlogListItem blogItem={item} />
                        </div>
                    )}
                />
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
    const tagNameList = await ContentFolderManager.getAllTagDataList()
    return tagNameList.map((name) => ({ tag: name.name }))
}
