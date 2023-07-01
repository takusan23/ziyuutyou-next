import { ReactNode } from "react"
import IconParent from "./IconParent"

/** Button へ渡すデータ */
export type ButtonProps = {
    /** ボタンテキスト */
    text: string
    /** アイコンを出すなら */
    startIcon?: ReactNode
    /** ボタンの種類。テキストだけ / 枠取り / 塗りつぶし */
    variant?: 'text' | 'outlined' | 'contained'
    /** 有効 / 無効 無効時は半透明になる */
    isDisabled?: boolean
    /** サイズ */
    size?: 'small' | 'medium' | 'large'
}

/** ボタン */
export default function Button({ text, startIcon, variant, isDisabled, size }: ButtonProps) {
    // className をつくる
    const buttonAlpha = isDisabled ? 'opacity-50' : 'opacity-100'
    const commonClassName = `${buttonAlpha} select-none`
    const nonNullVariant = variant ?? 'contained'

    // ボタンの Padding
    let buttonPaddingClassName: string
    switch (size ?? 'medium') {
        case 'small':
            buttonPaddingClassName = 'p-0.5 px-2'
            break
        case 'medium':
            buttonPaddingClassName = 'p-2'
            break
        case 'large':
            buttonPaddingClassName = 'p-3'
            break
    }

    // アイコンの色
    let iconColorClassName: string | undefined
    switch (nonNullVariant) {
        case "text":
            iconColorClassName = 'fill-content-primary-light dark:fill-content-primary-dark'
            break;
        case "contained":
            iconColorClassName = 'fill-[#ffffff]'
            break;
    }

    /** ボタンの中身を作成する */
    const createButtonContent = (
        <div className={`flex flex-row items-center space-x-1 ${buttonPaddingClassName}`}>
            {
                // 塗りつぶしだけ白色のアイコンにする
                startIcon && (
                    <IconParent
                        size={(size === 'small') ? 'small' : 'medium'}
                        className={iconColorClassName}
                    >
                        {startIcon}
                    </IconParent>
                )
            }
            <p>
                {text}
            </p>
        </div>
    )

    /** variant に合わせたボタンを生成する */
    const createButton = () => {
        // JSX で switch 使うの、関数にしないとダメ？
        switch (nonNullVariant) {
            case 'text':
                return (
                    <div className={`rounded-full text-content-primary-light dark:text-content-primary-dark ${commonClassName}`}>
                        {createButtonContent}
                    </div>
                )
            case 'outlined':
                return (
                    <div className={`rounded-full border-2 border-content-primary-light text-content-text-light dark:text-content-text-dark ${buttonAlpha}`}>
                        {createButtonContent}
                    </div>
                )
            case 'contained':
                return (
                    <div className={`rounded-full bg-content-primary-light text-[#ffffff] ${buttonAlpha}`}>
                        {createButtonContent}
                    </div>
                )
        }
    }

    return createButton()
}
