import HistoryOutlined from "@mui/icons-material/HistoryOutlined"
import Twitter from "@mui/icons-material/Twitter" 
import { Button } from "@mui/material"
import React from "react"

/** TwitterShareButton へ渡すデータ */
type TwitterShareButtonProps = {
    /** 記事タイトル */
    title: string,
    /** 記事のURL */
    url: string,
}

/** Twitterシェアボタン */
export const TwitterShareButton: React.FC<TwitterShareButtonProps> = (props) => {
    // 共有URL
    const href = `http://twitter.com/share?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title)}`
    return (
        <Button href={href} startIcon={<Twitter />} >
            Twitterで共有
        </Button>
    )
}

/** GitHubHistoryButton へ渡すデータ */
type GitHubHistoryButtonProps = {
    /** ファイル名 */
    fileName: string,
}

/** GitHubの履歴を出すボタン */
export const GitHubHistoryButton: React.FC<GitHubHistoryButtonProps> = (props) => {
    const href = `https://github.com/takusan23/ziyuutyou-next/commits/main/content/posts/${props.fileName}.md`
    return (
        <Button href={href} startIcon={<HistoryOutlined />} >
            GitHubで開く
        </Button>
    )
}