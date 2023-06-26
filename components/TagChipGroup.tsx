import NextLinkButton from "./NextLinkButton"
import MenuIcon from "../public/icon/material-menu.svg"
import Spacer from "./Spacer"

/** TagChipGroup へ渡すデータ */
type TagChipGroupProps = {
    /** タグ一覧 */
    tagList: Array<string>
}

/** タグを表示する */
export default function TagChipGroup({ tagList }: TagChipGroupProps) {
    return (
        <div className="flex flex-row flex-wrap gap-2">
            {
                tagList.map(tagName => (
                    <>
                        <NextLinkButton
                            size="small"
                            key={tagName}
                            href={`/posts/tag/${tagName}/`}
                            startIcon={<MenuIcon className="w-5 h-5" />}
                            text={tagName}
                        />
                    </>
                ))
            }
        </div>
    )
}