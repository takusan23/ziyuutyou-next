"use client"

import MarkdownData from "../../../src/data/MarkdownData"
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined"
import { Box, Typography, useTheme } from "@mui/material"
import Spacer from "../../../components/Spacer"
import RoundedCornerBox from "../../../components/RoundedCorner"
import { TocList, TocListLayout } from "../../../components/TocList"

/** 目次の幅 */
const TOC_LIST_WIDTH = 300

/** BlogDetail へ渡すデータ */
type ClientPageDetailPageProps = {
    /** 記事データ */
    markdownData: MarkdownData
}

/** 固定ページの本文 */
export default function ClientPageDetailPage({ markdownData }: ClientPageDetailPageProps) {
    const theme = useTheme()

    return (
        <>
            <Typography color="primary.main">
                <span style={{ fontSize: 30 }}>
                    {markdownData.title}
                </span>
            </Typography>
            <Spacer value={2} />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
            }}>
                <UploadFileOutlined color="primary" />
                <Typography color="primary.main">
                    {markdownData.createdAt}
                </Typography>
            </div>
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
                    color: ${theme.palette.primary.main}
                }
                img {
                    max-width: 80%;
                }
            `}</style>
        </>
    )
}