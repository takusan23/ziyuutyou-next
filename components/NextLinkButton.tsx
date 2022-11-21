import Button from "@mui/material/Button"
import Link from "next/link"

/** BlogListPagingButton へ渡すデータ */
type NextLinkButtonProps = {
    /** style */
    style?: React.CSSProperties,
    /** URL */
    href: string,
    /** ボタンテキスト */
    text: string,
    /** アイコンを出すなら */
    startIcon?: React.ReactNode,
    /** MUIのButtonのVariant */
    variant?: 'text' | 'outlined' | 'contained'
}

/** NextLinkなButton */
const NextLinkButton: React.FC<NextLinkButtonProps> = (props) => {
    return (
        <Link
            style={{
                ...props.style,
                textDecoration: 'none',
                color: 'inherit'
            }}
            href={props.href}
        >
            <Button
                variant={props.variant ?? "contained"}
                sx={{ borderRadius: 10 }}
                disableElevation
                startIcon={props.startIcon}
            >
                {props.text}
            </Button>
        </Link>
    )
}

export default NextLinkButton