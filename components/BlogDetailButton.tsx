import React from "react"
import NextLinkButton from "./NextLinkButton"
import EnvironmentTool from "../src/EnvironmentTool"

/** TwitterShareButton へ渡すデータ */
type TwitterShareButtonProps = {
    /** 記事タイトル */
    title: string
    /** 記事のURL */
    url: string
}

/** Twitterシェアボタン */
export const TwitterShareButton: React.FC<TwitterShareButtonProps> = (props) => {
    // 共有URL
    const href = `http://twitter.com/share?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title)}`
    return (
        <NextLinkButton
            variant="text"
            href={href}
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
            text="GitHubで開く" />
    )
}