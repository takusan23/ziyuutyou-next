import { Metadata } from "next";
import ContentFolderManager from "../../../src/ContentFolderManager";
import EnvironmentTool from "../../../src/EnvironmentTool";
import { GitHubHistoryButton } from "../../../components/BlogDetailButton";
import DateCountText from "../../../components/DateCountText";
import TagChipGroup from "../../../components/TagChipGroup";
import { ExpandTocList, LargeTocList, TocListLayout } from "../../../components/TocList";
import RoundedCornerBox from "../../../components/RoundedCornerBox";
import IconParent from "../../../components/IconParent";
import EditIcon from "../../../public/icon/edit.svg"
import ActivityPubShare from "../../../components/ActivityPubShare";
import MarkdownRender from "../../../components/markdownrender/MarkdownRender";

/** 動的ルーティング */
type PageProps = {
    params: Promise<{ page: string }>
}

/** head に値を入れる */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const markdownData = await ContentFolderManager.getPageItem(params.page)
    const ogpTitle = `${markdownData.title} - ${EnvironmentTool.SITE_NAME}`
    const ogpUrl = `${EnvironmentTool.BASE_URL}${markdownData.link}`

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
export default async function PageDetailPage(props: PageProps) {
    const params = await props.params;
    // サーバー側でロードする
    const markdownData = await ContentFolderManager.getPageItem(params.page)

    const ogpTitle = `${markdownData.title} - たくさんの自由帳`
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
        <div className="flex flex-row-reverse space-x-2 space-x-reverse">
            <GitHubHistoryButton fileName={markdownData.fileName} />
            <ActivityPubShare url={ogpUrl} title={ogpTitle} />
        </div>
    )

    // max-w-6xl m-auto で横幅上限+真ん中
    return (
        <article className="max-w-6xl m-auto flex flex-col space-y-4">

            <h1 className="text-content-primary-light dark:text-content-primary-dark text-3xl">
                {markdownData.title}
            </h1>
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
        </article>
    )
}

/** 生成するページを列挙して返す */
export async function generateStaticParams() {
    const pageNameList = await ContentFolderManager.getPageNameList()
    return pageNameList.map(name => ({ page: name }))
}