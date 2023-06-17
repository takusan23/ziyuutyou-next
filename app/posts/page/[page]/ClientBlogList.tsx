"use client"

import React from "react"
import Divider from "@mui/material/Divider"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import BlogItem from "../../../../src/data/BlogItem"
import RoundedCornerBox from "../../../../components/RoundedCorner"
import BlogListItem from "../../../../components/BlogListItem"
import Spacer from "../../../../components/Spacer"
import NextLinkButton from "../../../../components/NextLinkButton"

/** ClientBlogList へ渡すデータ */
export type ClientBlogListProps = {
    /** 記事一覧 */
    blogList: BlogItem[],
    /** ページ */
    pageId: number,
    /** 次のページID。ない場合はnullでもう次のページ無い */
    nextPageId: number | null,
    /** 前のページID。ない場合は(ry */
    prevPageId: number | null
}

/** 記事一覧ページ */
export default function ClientBlogList({ blogList, pageId, nextPageId, prevPageId }: ClientBlogListProps) {
    return (
        <>
            <RoundedCornerBox value={3}>
                {
                    blogList.map((blog, index) => (
                        <React.Fragment key={blog.link}>
                            {
                                // 区切り線を入れる。&&で右側がtrueなら左の評価もする仕様を使った方法らしい
                                // https://ja.reactjs.org/docs/conditional-rendering.html#inline-if-with-logical--operator
                                index != 0 && <Divider />
                            }
                            <BlogListItem blogItem={blog} />
                            <Spacer value={1} />
                        </React.Fragment>
                    ))
                }
            </RoundedCornerBox>

            <Box textAlign='center'>
                {
                    // 前のページボタンを出すか
                    prevPageId && <NextLinkButton
                        variant="contained"
                        href={`/posts/page/${prevPageId}/`}
                        text="前のページ"
                    />
                }
                {/* 今のページ */}
                <Button
                    variant="outlined"
                    sx={{ borderRadius: 10, margin: 1 }}
                    disableElevation
                >
                    {pageId}
                </Button>
                {
                    // 次のページを出すか。
                    nextPageId && <NextLinkButton
                        variant="contained"
                        href={`/posts/page/${pageId + 1}/`}
                        text="次のページ"
                    />
                }
            </Box>
        </>
    )
}