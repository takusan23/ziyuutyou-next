import React from "react"
import NextLinkButton from "./NextLinkButton"
import EnvironmentTool from "../src/EnvironmentTool"
import OpenInBrowserIcon from "../public/icon/open_in_browser.svg"

/** GitHubHistoryButton へ渡すデータ */
type GitHubHistoryButtonProps = {
    /** ファイル名 */
    fileName: string
}

/** GitHubの履歴を出すボタン */
export function GitHubHistoryButton({ fileName }: GitHubHistoryButtonProps) {
    const href = `${EnvironmentTool.REPOSITORY_URL}/commits/main/content/posts/${fileName}.md`
    return (
        <NextLinkButton
            variant="text"
            href={href}
            startIcon={<OpenInBrowserIcon />}
            text="GitHubで開く" />
    )
}