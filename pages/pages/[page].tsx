import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined"
import { Box, Typography, useTheme } from "@mui/material"
import { GetStaticPaths, GetStaticProps } from "next"
import Head from "next/head"
import RoundedCornerBox from "../../components/RoundedCorner"
import Spacer from "../../components/Spacer"
import { TocList, TocListLayout } from "../../components/TocList"
import ContentFolderManager from "../../src/ContentFolderManager"
import MarkdownData from "../../src/data/MarkdownData"

/** 目次の幅 */
const TOC_LIST_WIDTH = 300

/** BlogDetail へ渡すデータ */
type PageDetailsPrpos = {
    /** 記事データ */
    markdownData: MarkdownData,
}

/** ブログ本文 */
const PageDetail: React.FC<PageDetailsPrpos> = (props) => {
    const theme = useTheme()
    const ogpTitle = `${props.markdownData.title} - たくさんの自由帳`
    const ogpUrl = `https://takusan.negitoro.dev${props.markdownData.link}/`

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
            <Spacer value={2} />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
            }}>
                <UploadFileOutlined color="primary" />
                <Typography color="primary.main">
                    {props.markdownData.createdAt}
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
                                <div className="content_div" dangerouslySetInnerHTML={{ __html: props.markdownData.html }} />
                            </Box>
                        </RoundedCornerBox>
                    }
                    secondary={<TocList tocDataList={props.markdownData.tocDataList} />}
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

/**
 * ここでMarkdownを解析して返す。クライアント側で実行されない。
 * 
 * @param context [page]←これ取得するため
 * @returns 記事データ
 */
export const getStaticProps: GetStaticProps<PageDetailsPrpos> = async context => {
    const fileName = context.params['page'] as string
    const markdownData = await ContentFolderManager.getPageItem(fileName)
    return {
        props: {
            markdownData: markdownData
        }
    }
}

/**
 * 生成するページを列挙して返す。これも上記同様(ry
 * 
 * @returns 生成するページの名前
 */
export const getStaticPaths: GetStaticPaths = async () => {
    const fileNameList = (await ContentFolderManager.getPageNameList())
        .map(name => ({ params: { page: name } }))
    return {
        paths: fileNameList,
        fallback: false
    }
}

export default PageDetail