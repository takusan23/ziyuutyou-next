import Link from "next/link"
import Button, { ButtonProps } from "./Button"

/** NextLinkButton へ渡すデータ */
type NextLinkButtonProps = {
    /** URL */
    href: string
} & ButtonProps

/** NextLink でラップした <Button> */
export default function NextLinkButton({ href, text, startIcon, variant, isDisabled, size, rounded }: NextLinkButtonProps) {

    return (
        <Link
            className="flex items-center no-underline text-inherit"
            href={href}
        >
            <Button
                text={text}
                startIcon={startIcon}
                variant={variant}
                isDisabled={isDisabled}
                size={size}
                rounded={rounded} />
        </Link>
    )
}
