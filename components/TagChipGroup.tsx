import NextLinkButton from "./NextLinkButton"
import SellIcon from "../public/icon/sell.svg"

/** TagChipGroup へ渡すデータ */
type TagChipGroupProps = {
    /** タグ一覧 */
    tagList: string[]
}

/** タグを表示する */
export default function TagChipGroup({ tagList }: TagChipGroupProps) {
    return (
        <div className="flex flex-row flex-wrap gap-2">
            {
                tagList.map(tagName => (
                    <NextLinkButton
                        size="small"
                        key={tagName}
                        href={`/posts/tag/${tagName}/1/`}
                        startIcon={<SellIcon />}
                        text={tagName}
                    />
                ))
            }
        </div>
    )
}