"use client"

import TagData from "../../../../src/data/TagData";
import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined"
import { Box, Chip } from "@mui/material"
import Typography from "@mui/material/Typography"
import Link from "next/link"
import React from "react"
import Spacer from "../../../../components/Spacer";

/** ClientAllTagsPage へ渡すデータ */
type ClientAllTagsPageProps = {
    /** タグのデータ配列 */
    tags: TagData[],
    /** タグ件数 */
    tagCount: number,
}

/** タグ一覧ページ */
export default function ClientAllTagsPage({ tagCount, tags }: ClientAllTagsPageProps) {
    return (
        <>
            <Typography color="primary.main">
                <span style={{ fontSize: 30 }}>
                    タグ一覧
                </span>
            </Typography>
            <Typography color="primary.main">
                {`${tagCount} 件`}
            </Typography>
            <Spacer value={2} />

            <Box sx={{ padding: 0 }}>
                {tags.map((data) => (
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