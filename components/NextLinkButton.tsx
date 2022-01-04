import Button from "@mui/material/Button"
import Link from "next/link"

/** BlogListPagingButton へ渡すデータ */
type NextLinkButtonProps = {
    /** URL */
    href: string,
    /** ボタンテキスト */
    text: string,
}

/** NextLinkなButton */
const NextLinkButton: React.FC<NextLinkButtonProps> = (props) => {
    return (
        <Link passHref href={props.href}>
            <Button
                variant="contained"
                sx={{ borderRadius: 10 }}
                disableElevation
            >
                {props.text}
            </Button>
        </Link>
    )
}

export default NextLinkButton