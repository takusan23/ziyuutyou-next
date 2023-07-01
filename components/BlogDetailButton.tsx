import React from "react"
import NextLinkButton from "./NextLinkButton"
import EnvironmentTool from "../src/EnvironmentTool"
import OpenInBrowserIcon from "../public/icon/open_in_browser.svg"
import ShareIcon from "../public/icon/share.svg"

/** TwitterShareButton へ渡すデータ */
type TwitterShareButtonProps = {
    /** 記事タイトル */
    title: string
    /** 記事のURL */
    url: string
}

/** Twitterシェアボタン */
export function TwitterShareButton({ title, url }: TwitterShareButtonProps) {
    // 共有URL
    const href = `http://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    return (
        <NextLinkButton
            variant="text"
            href={href}
            startIcon={<ShareIcon />}
            text="Twitterで共有" />
    )
}

/** GitHubHistoryButton へ渡すデータ */
type GitHubHistoryButtonProps = {
    /** ファイル名 */
    fileName: string
}

/** GitHubの履歴を出すボタン */
export const GitHubHistoryButton: React.FC<GitHubHistoryButtonProps> = (props) => {
    const href = `${EnvironmentTool.REPOSITORY_URL}/commits/main/content/posts/${props.fileName}.md`
    return (
        <NextLinkButton
            variant="text"
            href={href}
            startIcon={<OpenInBrowserIcon />}
            text="GitHubで開く" />
    )
}