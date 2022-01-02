import BlogListItem from "../../../components/BlogListItem"
import BlogContentManager from "../../../src/BlogContentManager"
import BlogItem from "../../../src/data/BlogItem"
import { GetStaticPaths, GetStaticProps } from "next"
import React from "react"
import Spacer from "../../../components/Spacer"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"

/** 一度に取得する件数 */
const blogLimit = 10

/** BlogListPageProps へ渡すデータ */
type BlogListPageProps = {
    /** 記事一覧 */
    blogList: Array<BlogItem>
}

/** ブログ一覧ページ。動的ルーティング */
const BlogListPage: React.FC<BlogListPageProps> = ({ ...props }) => {
    const theme = useTheme()

    return (
        <Box color={theme.palette.primary.main}>
            {
                props.blogList.map((blog) => (
                    <React.Fragment key={blog.link}>
                        <BlogListItem blogItem={blog} />
                        <Spacer value={1} />
                    </React.Fragment>
                ))
            }
        </Box>
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
    const blogListResult = await BlogContentManager.getBlogItemList(blogLimit, blogLimit * (pageId - 1))
    const blogList = blogListResult.result
    return {
        props: {
            blogList: blogList
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
    const blogListResult = await BlogContentManager.getBlogItemList(1, 1)
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