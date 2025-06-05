import Link from "next/link"
import React from "react"
import BlogItem from "../src/data/BlogItem"
import Spacer from "./Spacer"
import TagChipGroup from "./TagChipGroup"
import IconParent from "./IconParent"
import UploadFileIcon from "../public/icon/upload_file.svg"

/**
 * BlogItem と同じパラメーターを取るが、一部を除いて Optional にしたもの。
 * 検索結果や関連記事はすべての項目を出さないので。
 */
type ExtendsBlogItem = {
    /** タイトル */
    title: string
    /** URL */
    link: string
} & Partial<BlogItem>

/** BlogItem へ渡すデータ */
type BlogItemProps = {
    /** 記事のデータ */
    blogItem: ExtendsBlogItem
}

/** 記事一覧の各レイアウト */
export default function BlogListItem({ blogItem }: BlogItemProps) {
    return (
        <div className="flex flex-col p-5">

            <Link href={blogItem.link}>
                <h2 className="text-content-primary-light dark:text-content-primary-dark text-2xl underline">
                    {blogItem.title}
                </h2>
            </Link>
            {
                blogItem.description && <p className="text-content-primary-light dark:text-content-primary-dark py-2 text-sm">
                    {blogItem.description}
                </p>
            }
            {
                blogItem.tags && <>
                    <Spacer space="small" />
                    <TagChipGroup tagList={blogItem.tags} />
                </>
            }
            {
                blogItem.createdAt && <>
                    <Spacer space="small" />
                    <div className="flex flex-row items-center">
                        <IconParent>
                            <UploadFileIcon />
                        </IconParent>
                        <p className="text-content-primary-light dark:text-content-primary-dark text-md">
                            <time>{blogItem.createdAt}</time>
                            <span className="ml-1">投稿</span>
                        </p>
                    </div>
                </>
            }
        </div>
    )
}