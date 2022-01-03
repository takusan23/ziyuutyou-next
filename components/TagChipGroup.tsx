import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined"
import Chip from "@mui/material/Chip"

/** TagChipGroup へ渡すデータ */
type TagChipGroupProps = {
    /** タグ一覧 */
    tagList: Array<string>
}

/** タグを表示するChip */
const TagChipGroup: React.FC<TagChipGroupProps> = (props) => {
    return (
        <>
            {
                props.tagList.map(tagName => (
                    <Chip
                        key={tagName}
                        sx={{
                            marginRight: 1
                        }}
                        color="primary"
                        icon={<LocalOfferOutlined />}
                        label={tagName}
                    />
                ))
            }
        </>
    )
}

export default TagChipGroup