"use client"

import BlogItem from "../../../../src/data/BlogItem"
import React from "react"
import { Divider, Typography } from "@mui/material"
import RoundedCornerBox from "../../../../components/RoundedCorner"
import Spacer from "../../../../components/Spacer"
import BlogListItem from "../../../../components/BlogListItem"

/** ClientTagListPage へ渡すデータ */
export type ClientTagListPageProps = {
    /** 記事一覧 */
    blogList: BlogItem[],
    /** タグの名前 */
    tagName: string,
    /** 合計記事数 */
    totalItemCount: number,
}

/** タグがついてる記事一覧ページ */
export default function ClientTagListPage({ blogList, tagName, totalItemCount }: ClientTagListPageProps) {
    return (
        <>
            <Typography color="primary.main">
                <span style={{ fontSize: 30 }}>
                    {`${tagName}`}
                </span>
            </Typography>
            <Typography color="primary.main">
                {`${totalItemCount} 件`}
            </Typography>
            <Spacer value={2} />
            <RoundedCornerBox value={3}>
                {
                    blogList.map((blog, index) => (
                        <React.Fragment key={blog.link}>
                            {
                                index != 0 && <Divider />
                            }
                            <BlogListItem blogItem={blog} />
                            <Spacer value={1} />
                        </React.Fragment>
                    ))
                }
            </RoundedCornerBox>
        </>
    )
}