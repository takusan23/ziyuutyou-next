import BlogListItem from "../../../components/BlogListItem"
import BlogItem from "../../../src/data/BlogItem"
import { GetStaticPaths, GetStaticProps } from "next"
import React from "react"
import Spacer from "../../../components/Spacer"
import RoundedCornerBox from "../../../components/RoundedCorner"
import Divider from "@mui/material/Divider"
import ContentFolderManager from "../../../src/ContentFolderManager"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import Link from "next/link"

/** 一度に取得する件数 */
const blogLimit = 10

/** BlogListPagingButton へ渡すデータ */
type BlogListPagingButtonProps = {
    /** URL */
    href: string,
    /** ボタンテキスト */
    text: string,
}

/** NextLinkなButton */
const BlogListPagingButton: React.FC<BlogListPagingButtonProps> = (props) => {
    return (
        <Link href={props.href}>
            <Button
                variant="contained"
                sx={{ borderRadius: 10 }}
                disableElevation
            >
                {props.text}
            </Button>
        </Link>
    )
}

/** BlogListPageProps へ渡すデータ */
type BlogListPageProps = {
    /** 記事一覧 */
    blogList: Array<BlogItem>,
    /** ページ */
    pageId: number,
    /** 次のページID。ない場合はnullでもう次のページ無い */
    nextPageId?: number,
    /** 前のページID。ない場合は(ry */
    prevPageId?: number,
}

/** ブログ一覧ページ。動的ルーティング */
const BlogListPage: React.FC<BlogListPageProps> = ({ ...props }) => {

    return (
        <>
            <RoundedCornerBox value={3}>
                {
                    props.blogList.map((blog, index) => (
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
                    // 前のページボタンを出すか。null以外で
                    props.prevPageId !== null && <BlogListPagingButton
                        href={`/posts/page/${props.prevPageId}`}
                        text="前のページ"
                    />
                }
                {/* 今のページ */}
                <Button
                    variant="outlined"
                    sx={{ borderRadius: 10, margin: 1 }}
                    disableElevation
                >
                    {`${props.pageId}`}
                </Button>
                {
                    // 次のページを出すか。(ry
                    props.nextPageId !== null && <BlogListPagingButton
                        href={`/posts/page/${props.pageId + 1}`}
                        text="次のページ"
                    />
                }
            </Box>
        </>
    )
}

/**
 * 静的書き出し（意味深）のときに呼ばれ、クライアント側では呼ばれない関数。同じJSだから分かりにくいねん。
 * 
 * クライアント側で実行されないため、サーバーマシンのファイル操作が可能です。(NodeJSのAPIが利用可能)
 * 
 * ブラウザ再読み込み時に呼ばれる。
 * 
 * ここでブログの一覧を取得する。
 */
export const getStaticProps: GetStaticProps<BlogListPageProps> = async context => {
    // posts/page/<ここ> を取得
    const pageId = parseInt(context.params["page"] as string)
    // 記事一覧を取得する。async なので待つ。-1してるのは1ページ目はskip:0にしたいため
    const blogListResult = await ContentFolderManager.getBlogItemList(blogLimit, blogLimit * (pageId - 1))
    const blogList = blogListResult.result
    const totalCount = blogListResult.totalCount
    // 次のページ、前のページボタン
    const nextPageId = ((blogLimit * pageId) <= totalCount) ? pageId + 1 : null
    const prevPageId = (pageId > 1) ? pageId - 1 : null
    return {
        props: {
            blogList: blogList,
            pageId: pageId,
            nextPageId: nextPageId,
            prevPageId: prevPageId
        }
    };
}

/**
 * 名前がややこしいけど、こっちは生成するHTMLのパスを返す関数です。
 * 
 * これも静的書き出しのときに呼ばれ、クライアント側で実行されません。
 * 
 * ブログ一覧では次のページを生成する必要があるため、必要な次のページの分だけURLを作って返す必要があります。(実際は[page]の部分ですが)
 */
export const getStaticPaths: GetStaticPaths = async () => {
    // async なので待つ。合計数がほしいので適当に一つだけ
    const blogListResult = await ContentFolderManager.getBlogItemList(1, 1)
    const totalCount = blogListResult.totalCount
    // 割り算をして必要な数用意する
    const requirePageCount = (totalCount / blogLimit) + 1 // あまりのために +1
    // 必要なURLを作成
    const pathIdList = []
    for (let i = 0; i < requirePageCount; i++) {
        pathIdList.push({ params: { page: `${i}` } })
    }
    return {
        paths: pathIdList,
        fallback: false
    }
}


export default BlogListPage