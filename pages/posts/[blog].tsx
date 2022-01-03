import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined"
import { Typography, useTheme } from "@mui/material"
import Box from "@mui/material/Box"
import { GetStaticPaths, GetStaticProps } from "next"
import React from "react"
import RoundedCornerBox from "../../components/RoundedCorner"
import Spacer from "../../components/Spacer"
import TagChipGroup from "../../components/TagChipGroup"
import ContentFolderManager from "../../src/ContentFolderManager"
import MarkdownData from "../../src/data/MarkdownData"

/** BlogDetail へ渡すデータ */
type BlogDetailProps = {
    /** 記事データ */
    markdownData: MarkdownData,
}

/** ブログ本文 */
const BlogDetail: React.FC<BlogDetailProps> = (props) => {
    const theme = useTheme()
    return (
        <>
            <Typography color="primary.main">
                <span style={{ fontSize: 30 }}>
                    {props.markdownData.title}
                </span>
            </Typography>
            <TagChipGroup tagList={props.markdownData.tags} />
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
            <RoundedCornerBox>
                <Box sx={{ padding: 2 }}>
                    <div id="content_div" dangerouslySetInnerHTML={{ __html: props.markdownData.html }} />
                </Box>
            </RoundedCornerBox>
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
    const fileNameList = ContentFolderManager.getBlogNameList()
        // この場合はキーが blog になるけどこれはファイル名によって変わる（[page].tsxなら page がキーになる）
        .map(name => ({ params: { blog: `${name}` } }))
    return {
        paths: fileNameList,
        fallback: false
    }
}


export default BlogDetail