import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined"
import { Box, Typography, useTheme } from "@mui/material"
import { GetStaticPaths, GetStaticProps } from "next"
import RoundedCornerBox from "../../components/RoundedCorner"
import Spacer from "../../components/Spacer"
import ContentFolderManager from "../../src/ContentFolderManager"
import MarkdownData from "../../src/data/MarkdownData"

/** BlogDetail へ渡すデータ */
type PageDetailsPrpos = {
    /** 記事データ */
    markdownData: MarkdownData,
}

/** ブログ本文 */
const PageDetail: React.FC<PageDetailsPrpos> = (props) => {
    const theme = useTheme()
    return (
        <>
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
    const fileNameList = ContentFolderManager.getPageNameList()
        .map(name => ({ params: { page: `${name}` } }))
    return {
        paths: fileNameList,
        fallback: false
    }
}

export default PageDetail