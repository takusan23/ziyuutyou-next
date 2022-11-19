import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined"
import { Box, Chip } from "@mui/material"
import Typography from "@mui/material/Typography"
import { GetStaticProps } from "next"
import Head from "next/head"
import Link from "next/link"
import React from "react"
import Spacer from "../../../components/Spacer"
import ContentFolderManager from "../../../src/ContentFolderManager"
import TagData from "../../../src/data/TagData"

/** AllTags へ渡すデータ */
type AllTagsProps = {
    /** タグのデータ配列 */
    tags: Array<TagData>,
    /** タグ件数 */
    tagCount: number,
}

/** タグ一覧 */
const AllTags: React.FC<AllTagsProps> = (props) => {
    return (
        <>
            <Head>
                <title>タグ一覧 - たくさんの自由帳</title>
            </Head>

            <Typography color="primary.main">
                <span style={{ fontSize: 30 }}>
                    タグ一覧
                </span>
            </Typography>
            <Typography color="primary.main">
                {`${props.tagCount} 件`}
            </Typography>
            <Spacer value={2} />

            <Box sx={{ padding: 0 }}>
                {props.tags.map((data) => (
                    <Link
                        style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                        href={`/posts/tag/${data.name}/`}
                        key={data.name}
                    >
                        <Chip
                            sx={{
                                marginRight: 1,
                                marginTop: 1
                            }}
                            clickable
                            color="primary"
                            icon={<LocalOfferOutlined />}
                            label={`${data.name} - ${data.count} 件`}
                        />
                    </Link>
                ))}
            </Box>
        </>
    )
}

export default AllTags

/** タグ一覧を用意する */
export const getStaticProps: GetStaticProps<AllTagsProps> = async context => {
    const tagDataList = await ContentFolderManager.getAllTagDataList()
    return {
        props: {
            tags: tagDataList,
            tagCount: tagDataList.length
        }
    }
}
