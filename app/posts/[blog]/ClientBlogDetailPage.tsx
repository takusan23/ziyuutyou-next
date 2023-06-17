"use client"

import CreateOutlined from "@mui/icons-material/CreateOutlined"
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined"
import { Typography, useTheme } from "@mui/material"
import Box from "@mui/material/Box"
import React, { useEffect, useState } from "react"
import DateDiffTool from "../../../src/DateDiffTool"
import MarkdownData from "../../../src/data/MarkdownData"
import { GitHubHistoryButton, TwitterShareButton } from "../../../components/BlogDetailButton"
import Spacer from "../../../components/Spacer"
import TagChipGroup from "../../../components/TagChipGroup"
import RoundedCornerBox from "../../../components/RoundedCorner"
import { TocList, TocListLayout } from "../../../components/TocList"
import UrlTool from "../../../src/UrlTool"

/** 目次の幅 */
const TOC_LIST_WIDTH = 300

/** ClientBlogDetailPage へ渡すデータ */
type ClientBlogDetailPageProps = {
    /** 記事データ */
    markdownData: MarkdownData
}

/** ブログ本文 */
export default function ClientBlogDetailPage({ markdownData }: ClientBlogDetailPageProps) {
    const theme = useTheme()
    const ogpTitle = `${markdownData.title} - たくさんの自由帳`
    const ogpUrl = `${UrlTool.BASE_URL}${markdownData.link}`
    // timeタグに入れるやつ、これ必要？ yyyy-MM-dd
    const dateTimeFormat = markdownData.createdAt.replace(/\//g, '-')

    // 何日前かを計算する
    const [diffDate, setDiffDate] = useState(0)
    useEffect(() => {
        // クライアント側で計算する
        setDiffDate(DateDiffTool.nowDateDiff(markdownData.createdAtUnixTime))
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
                {`文字数(だいたい) : ${markdownData.textCount}`}
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
                <time dateTime={dateTimeFormat}>{markdownData.createdAt}</time>
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
            <GitHubHistoryButton fileName={markdownData.fileName} />
        </Box>
    )

    return (
        <>
            <Typography color="primary.main">
                <span style={{ fontSize: 30 }}>
                    {markdownData.title}
                </span>
            </Typography>

            {createdAtText}
            {textCountText}
            <Spacer value={2} />
            <TagChipGroup tagList={markdownData.tags} />
            {shareOrHistoryButton}
            <Spacer value={2} />

            <RoundedCornerBox colorCode={theme.palette.background.secondary}>
                {/* 画面の幅が広いときだけ目次を表示させる */}
                <TocListLayout
                    secondaryWidth={TOC_LIST_WIDTH}
                    master={
                        <RoundedCornerBox>
                            <Box sx={{ padding: 2 }}>
                                <div className="content_div" dangerouslySetInnerHTML={{ __html: markdownData.html }} />
                            </Box>
                        </RoundedCornerBox>
                    }
                    secondary={<TocList tocDataList={markdownData.tocDataList} />}
                />
            </RoundedCornerBox>
            <Spacer value={1} />

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