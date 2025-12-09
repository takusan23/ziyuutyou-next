import NextLinkButton from "./NextLinkButton"
import EnvironmentTool from "../src/EnvironmentTool"
import Icon from "./Icon"

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
            startIcon={<Icon iconStyle="mask-[url('/icon/open_in_browser.svg')]" size="medium" color="currentColor" />}
            text="GitHubで開く" />
    )
}