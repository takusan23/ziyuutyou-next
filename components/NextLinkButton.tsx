import { CSSProperties, ReactNode } from "react"
import Link from "next/link"

/** BlogListPagingButton へ渡すデータ */
type NextLinkButtonProps = {
    /** style */
    style?: CSSProperties,
    /** URL */
    href: string,
    /** ボタンテキスト */
    text: string,
    /** アイコンを出すなら */
    startIcon?: ReactNode,
    /** ボタンの種類。テキストだけ / 枠取り / 塗りつぶし */
    variant?: 'text' | 'outlined' | 'contained'
}

/** NextLinkなButton */
export default function NextLinkButton({ style, href, text, startIcon, variant }: NextLinkButtonProps) {

    /** ボタンの中身を作成する */
    const createButtonContent = (
        <>
            {
                // アイコンとテキストの間のスペース確保
                !!startIcon && <div className="mr-2"> {startIcon} </div>
            }
            <p>{text}</p>
        </>
    )

    /** variant に合わせたボタンを生成する */
    const createButton = () => {
        // JSX で switch 使うの、関数にしないとダメ？
        switch (variant ?? 'contained') {
            case 'text':
                return (
                    <div className="flex flex-row items-center rounded-full text-content-primary-light">
                        {createButtonContent}
                    </div>
                )
            case 'outlined':
                return (
                    <div className="flex flex-row items-center rounded-full border-4 border-content-primary-light">
                        {createButtonContent}
                    </div>
                )
            case 'contained':
                return (
                    <div className="flex flex-row py-2 px-3 items-center rounded-full bg-content-primary-light text-[#ffffff]">
                        {createButtonContent}
                    </div>
                )
        }
    }

    return (
        <Link
            className="no-underline text-inherit"
            href={href}
        >
            {createButton()}
        </Link>
    )
}
