import { Metadata } from "next"
import ContentFolderManager from "../../../src/ContentFolderManager"
import EnvironmentTool from "../../../src/EnvironmentTool"
import { GitHubHistoryButton } from "../../../components/BlogDetailButton"
import TagChipGroup from "../../../components/TagChipGroup"
import RoundedCornerBox from "../../../components/RoundedCornerBox"
import { ExpandTocList, LargeTocList, TocListLayout } from "../../../components/TocList"
import DateCountText from "../../../components/DateCountText"
import IconParent from "../../../components/IconParent"
import EditIcon from "../../../public/icon/edit.svg"
import ActivityPubShare from "../../../components/ActivityPubShare"
import MarkdownRender from "../../../components/markdownrender/MarkdownRender"
import Title from "../../../components/Title"
import NextLinkButton from "../../../components/NextLinkButton"
import ArrowBackIcon from "../../../public/icon/arrow_back.svg"
import RoundedCornerList from "../../../components/RoundedCornerList"
import BlogListItem from "../../../components/BlogListItem"

/** 一度に取得する件数 */
const BLOG_SIZE_LIMIT = 10

/** 一度に取得する関連記事 */
const MAX_RELATED_SIZE = 5

/** 動的ルーティング */
type PageProps = {
    params: Promise<{ blog: string }>
}

/** head に値を入れる */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)
    const ogpTitle = `${markdownData.title} - ${EnvironmentTool.SITE_NAME}`
    const ogpUrl = `${EnvironmentTool.BASE_URL}${markdownData.link}`

    return {
        title: ogpTitle,
        alternates: {
            canonical: ogpUrl
        },
        openGraph: {
            title: ogpTitle,
            url: ogpUrl,
            // OGP 画像は opengraph-image.png/route.tsx 参照
            images: EnvironmentTool.DISABLE_OGP_IMAGE ? undefined : `${ogpUrl}opengraph-image.png`
        }
    }
}

/**
 * 記事本文。
 * 反映されない場合はスーパーリロードしてみてください。
 */
export default async function BlogDetailPage(props: PageProps) {
    const params = await props.params;
    // サーバー側で（ブラウザじゃなく Node.js ）ロードする
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)
    const backPostsPageNumber = await ContentFolderManager.findPostsPageNumber(markdownData.link, BLOG_SIZE_LIMIT)
    const relatedBlogList = await ContentFolderManager.findRelatedBlogItemList(markdownData.link, markdownData.tags, MAX_RELATED_SIZE)

    const ogpTitle = `${markdownData.title} - ${EnvironmentTool.SITE_NAME}`
    const ogpUrl = `${EnvironmentTool.BASE_URL}${markdownData.link}`
    const dateTimeFormat = markdownData.createdAt.replace(/\//g, '-')

    /** 文字数 */
    const textCountText = (
        <div className="flex flex-row flex-wrap items-center">
            <IconParent className="fill-content-primary-light dark:fill-content-primary-dark">
                <EditIcon />
            </IconParent>
            <p className="text-content-primary-light dark:text-content-primary-dark">
                {`文字数(だいたい) : ${markdownData.textCount}`}
            </p>
        </div>
    )

    /* 共有、GitHub履歴 */
    const shareOrHistoryButton = (
        <div className="flex flex-row-reverse flex-wrap space-x-2 space-x-reverse">
            <GitHubHistoryButton fileName={markdownData.fileName} />
            <ActivityPubShare url={ogpUrl} title={ogpTitle} />
        </div>
    )

    // max-w-6xl m-auto で横幅上限+真ん中
    return (
        <article className="max-w-6xl m-auto flex flex-col space-y-4">

            <NextLinkButton
                size="small"
                variant="outlined"
                href={`/posts/page/${backPostsPageNumber}/`}
                startIcon={<ArrowBackIcon />}
                text="記事一覧に戻る" />

            <Title title={markdownData.title} />

            <div>
                <DateCountText
                    timeTagTimeFormat={dateTimeFormat}
                    dateTimeFormat={markdownData.createdAt}
                    createdAtUnixTime={markdownData.createdAtUnixTime} />
                {textCountText}
            </div>

            <TagChipGroup tagList={markdownData.tags} />
            {shareOrHistoryButton}

            {/* 画面の幅が狭いときは記事始まる前に目次を置く */}
            <ExpandTocList markdown={markdownData.markdown} />

            {/* 画面の幅が広いときだけ目次を表示させる */}
            <TocListLayout secondary={<LargeTocList markdown={markdownData.markdown} />}>
                <RoundedCornerBox rounded="large">
                    <div className="p-4">
                        <MarkdownRender markdown={markdownData.markdown} />
                    </div>
                </RoundedCornerBox>
            </TocListLayout>

            {/* 関連記事。回遊しやすいように */}
            <p className="py-3 text-content-primary-light dark:text-content-primary-dark text-2xl">関連記事</p>
            <RoundedCornerList
                list={relatedBlogList}
                content={(className, blogItem) => (
                    <div
                        className={`bg-container-primary-light dark:bg-container-primary-dark ${className}`}
                        key={blogItem.link}
                    >
                        <BlogListItem
                            blogItem={{
                                link: blogItem.link,
                                title: blogItem.title,
                                createdAt: blogItem.createdAt
                            }} />
                    </div>
                )}
            />
        </article>
    )
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