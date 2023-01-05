import CreateOutlined from "@mui/icons-material/CreateOutlined"
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined"
import { Typography, useTheme } from "@mui/material"
import Box from "@mui/material/Box"
import { GetStaticPaths, GetStaticProps } from "next"
import Head from "next/head"
import React, { useEffect, useState } from "react"
import { GitHubHistoryButton, TwitterShareButton } from "../../components/BlogDetailButton"
import RoundedCornerBox from "../../components/RoundedCorner"
import Spacer from "../../components/Spacer"
import TagChipGroup from "../../components/TagChipGroup"
import { TocListLayout, TocList } from "../../components/TocList"
import ContentFolderManager from "../../src/ContentFolderManager"
import MarkdownData from "../../src/data/MarkdownData"
import DateDiffTool from "../../src/DateDiffTool"

/** 目次の幅 */
const TOC_LIST_WIDTH = 300

/** BlogDetail へ渡すデータ */
type BlogDetailProps = {
    /** 記事データ */
    markdownData: MarkdownData,
}

/** ブログ本文 */
const BlogDetail: React.FC<BlogDetailProps> = (props) => {
    const theme = useTheme()
    const ogpTitle = `${props.markdownData.title} - たくさんの自由帳`
    const ogpUrl = `https://takusan.negitoro.dev${props.markdownData.link}`
    // timeタグに入れるやつ、これ必要？ yyyy-MM-dd
    const dateTimeFormat = props.markdownData.createdAt.replace(/\//g, '-')

    // 何日前かを計算する
    const [diffDate, setDiffDate] = useState(0)
    useEffect(() => {
        // クライアント側で計算する
        setDiffDate(DateDiffTool.nowDateDiff(dateTimeFormat))
    }, [])

    /** 文字数 */
    const textCountText = (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
        }}>
            <CreateOutlined color="primary" />
            <Typography color="primary.main">
                {`文字数(だいたい) : ${props.markdownData.textCount}`}
            </Typography>
        </div>
    )

    /** 投稿日 */
    const createdAtText = (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
        }}>
            <UploadFileOutlined color="primary" />
            <Typography color="primary.main">
                {`投稿日 : `}
                <time dateTime={dateTimeFormat}>{props.markdownData.createdAt}</time>
                {` | ${diffDate} 日前`}
            </Typography>
        </div>
    )

    /* 共有、GitHub履歴 */
    const shareOrHistoryButton = (
        <Box textAlign="end">
            <TwitterShareButton
                url={ogpUrl}
                title={ogpTitle}
            />
            <GitHubHistoryButton fileName={props.markdownData.fileName} />
        </Box>
    )

    return (
        <>
            <Head>
                <title>{ogpTitle}</title>
                <meta property="og:url" content={ogpUrl}></meta>
                <meta property="og:title" content={ogpTitle}></meta>
                <link rel="canonical" href={ogpUrl} />
            </Head>

            <Typography color="primary.main">
                <span style={{ fontSize: 30 }}>
                    {props.markdownData.title}
                </span>
            </Typography>

            {createdAtText}
            {textCountText}
            <Spacer value={2} />
            <TagChipGroup tagList={props.markdownData.tags} />
            {shareOrHistoryButton}
            <Spacer value={2} />

            {/* 画面の幅が広いときだけ目次を表示させる */}
            <TocListLayout
                secondaryWidth={TOC_LIST_WIDTH}
                master={
                    <RoundedCornerBox>
                        <Box sx={{ padding: 2 }}>
                            <div className="content_div" dangerouslySetInnerHTML={{ __html: props.markdownData.html }} />
                        </Box>
                        <Spacer value={1} />
                    </RoundedCornerBox>
                }
                secondary={<TocList tocDataList={props.markdownData.tocDataList} />}
            />

            {/* Vue.jsにもあるcssのあれ */}
            <style jsx global>{`
                h1, h2, h3, h4, h5, h6 {
                    color: ${theme.palette.primary.main};
                }
                .content_div img {
                    max-width: 80%;
                }
            `}</style>
        </>
    )
}

/**
 * ここでMarkdownファイルを読み込む
 * 
 * この関数は静的書き出し（意味深）のときに呼ばれ、クライアント側では呼ばれない。
 * 
 * @param context 動的ルーティングのパスが入ってる
 */
export const getStaticProps: GetStaticProps<BlogDetailProps> = async context => {
    const fileName = context.params['blog'] as string
    const markdownData = await ContentFolderManager.getBlogItem(fileName)
    return {
        props: {
            markdownData: markdownData
        }
    }
}

/**
 * ここで生成するページを列挙して返す。（実際にはパスの一部）
 * 
 * /posts/<ここ> ←ここの部分の名前を渡して生成すべきページを全部列挙して返してる
 * 
 * これも上記同様クライアント側では呼ばれない。
 */
export const getStaticPaths: GetStaticPaths = async () => {
    const fileNameList = (await ContentFolderManager.getBlogNameList())
        // この場合はキーが blog になるけどこれはファイル名によって変わる（[page].tsxなら page がキーになる）
        .map(name => ({ params: { blog: name } }))
    return {
        paths: fileNameList,
        fallback: false
    }
}


export default BlogDetail