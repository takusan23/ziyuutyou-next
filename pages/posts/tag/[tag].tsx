import { BlogListPageProps } from "../page/[page]"
import BlogListPage from "../page/[page]"
import { GetStaticPaths, GetStaticProps } from "next"
import ContentFolderManager from "../../../src/ContentFolderManager"

/** タグ一覧画面。基本的にはブログ記事一覧を使い回せる */
const TagListPage: React.FC<BlogListPageProps> = (props) => {
    return <BlogListPage
        nextPageId={props.nextPageId}
        blogList={props.blogList}
        pageId={props.pageId}
        prevPageId={props.prevPageId}
    />
}

/**
 * タグページを表示する際に使うデータを作成
 * 
 * 静的書き出し時に呼ばれる
 */
export const getStaticProps: GetStaticProps<BlogListPageProps> = async context => {
    const tagName = context.params["tag"] as string
    // ページネーションは後で
    const tagFilterBlogList = await ContentFolderManager.getTagFilterBlogItem(tagName, -1, -1)
    return {
        props: {
            blogList: tagFilterBlogList.result,
            pageId: 1,
            nextPageId: null,
            prevPageId: null
        }
    }
}

/** 
 * タグの数だけタグのページを作る
 * 
 * 静的書き出し時に呼ばれる
 */
export const getStaticPaths: GetStaticPaths = async () => {
    const tagNameList = await ContentFolderManager.getAllTagList()
    const pathList = tagNameList
        .map((name) => ({ params: { tag: name } }))
    return {
        paths: pathList,
        fallback: false
    }
}

export default TagListPage