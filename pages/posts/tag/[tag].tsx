import { GetStaticPaths, GetStaticProps } from "next"
import ContentFolderManager from "../../../src/ContentFolderManager"
import BlogItem from "../../../src/data/BlogItem"
import Head from "next/head"
import RoundedCornerBox from "../../../components/RoundedCorner"
import React from "react"
import BlogListItem from "../../../components/BlogListItem"
import Spacer from "../../../components/Spacer"
import { Divider, Typography } from "@mui/material"

/** TagListPage へ渡すデータ */
export type TagListPageProps = {
    /** 記事一覧 */
    blogList: Array<BlogItem>,
    /** タグの名前 */
    tagName: string,
    /** 合計記事数 */
    totalItemCount: number,
}

/** タグ一覧画面。ページネーションはまた今度 */
const TagListPage: React.FC<TagListPageProps> = (props) => {
    // 正規URL。 送信された URL が正規 URL として選択されていません 対策
    const canonicalUrl = `https://takusan.negitoro.dev/posts/tag/${props.tagName}/`
    return (
        <>
            <Head>
                <title>{`タグ名:${props.tagName} - たくさんの自由帳`}</title>
                <link rel="canonical" href={canonicalUrl} />
            </Head>
            <Typography color="primary.main">
                <span style={{ fontSize: 30 }}>
                    {`${props.tagName}`}
                </span>
            </Typography>
            <Typography color="primary.main">
                {`${props.totalItemCount} 件`}
            </Typography>
            <Spacer value={2} />
            <RoundedCornerBox value={3}>
                {
                    props.blogList.map((blog, index) => (
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

/**
 * タグページを表示する際に使うデータを作成
 * 
 * 静的書き出し時に呼ばれる
 */
export const getStaticProps: GetStaticProps<TagListPageProps> = async context => {
    const tagName = context.params["tag"] as string
    // ページネーションは後で
    const tagFilterBlogList = await ContentFolderManager.getTagFilterBlogItem(tagName)
    return {
        props: {
            blogList: tagFilterBlogList.result,
            tagName: tagName,
            totalItemCount: tagFilterBlogList.totalCount
        }
    }
}

/** 
 * タグの数だけタグのページを作る
 * 
 * 静的書き出し時に呼ばれる
 */
export const getStaticPaths: GetStaticPaths = async () => {
    const tagNameList = await ContentFolderManager.getAllTagDataList()
    const pathList = tagNameList
        .map((name) => ({ params: { tag: name.name } }))
    return {
        paths: pathList,
        fallback: false
    }
}

export default TagListPage