import Link from "next/link"
import React from "react"
import BlogItem from "../src/data/BlogItem"
import Spacer from "./Spacer"
import TagChipGroup from "./TagChipGroup"
import MenuIcon from "../public/icon/material-menu.svg"

/** BlogItem へ渡すデータ */
type BlogItemProps = {
    /** 記事のデータ */
    blogItem: BlogItem
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
            <p className="text-content-primary-light dark:text-content-primary-dark py-2 text-sm">
                {blogItem.description}
            </p>

            <Spacer space="small" />
            <TagChipGroup tagList={blogItem.tags} />

            <Spacer space="small" />
            <div className="flex flex-row items-center">
                <MenuIcon className="h-5 w-5" />
                <p className="text-content-primary-light dark:text-content-primary-dark text-md">
                    <time>{blogItem.createdAt}</time>
                    <span className="ml-1">投稿</span>
                </p>
            </div>
        </div>
    )
}