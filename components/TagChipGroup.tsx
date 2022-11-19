import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined"
import Chip from "@mui/material/Chip"
import Link from "next/link"

/** TagChipGroup へ渡すデータ */
type TagChipGroupProps = {
    /** タグ一覧 */
    tagList: Array<string>
}

/** タグを表示するChip。上方向にMarginかけてるので注意 */
const TagChipGroup: React.FC<TagChipGroupProps> = (props) => {
    return (
        <>
            {
                props.tagList.map(tagName => (
                    <Link
                        style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                        href={`/posts/tag/${tagName}/`}
                        key={tagName}
                    >
                        <Chip
                            sx={{
                                marginRight: 1,
                                marginTop: 1
                            }}
                            clickable
                            color="primary"
                            icon={<LocalOfferOutlined />}
                            label={tagName}
                        />
                    </Link>
                ))
            }
        </>
    )
}

export default TagChipGroup