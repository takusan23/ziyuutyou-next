import { ReactNode } from "react"
import IconParent from "./IconParent"

/** Button へ渡すデータ */
export type ButtonProps = {
    /** ボタンテキスト */
    text: string
    /** アイコンを出すなら */
    startIcon?: ReactNode
    /** 後ろにアイコンを出すなら */
    endIcon?: ReactNode
    /** ボタンの種類。テキストだけ / 枠取り / 塗りつぶし */
    variant?: 'text' | 'outlined' | 'contained'
    /** 有効 / 無効 無効時は半透明になる */
    isDisabled?: boolean
    /** サイズ */
    size?: 'small' | 'medium' | 'large'
    /** 角の丸を個別に指定する場合。未指定で rounded-full */
    rounded?: {
        startTop?: 'small' | 'medium' | 'large'
        startBottom?: 'small' | 'medium' | 'large'
        endTop?: 'small' | 'medium' | 'large'
        endBottom?: 'small' | 'medium' | 'large'
    }
}

/** ボタン */
export default function Button({ text, startIcon, endIcon, variant, isDisabled, size, rounded }: ButtonProps) {
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
    let iconColorClassName = ''
    switch (nonNullVariant) {
        case "text":
            iconColorClassName = 'fill-content-primary-light dark:fill-content-primary-dark'
            break;
        case "contained":
            iconColorClassName = 'fill-[#ffffff]'
            break;
    }

    // 角丸。デフォルトは 100%
    // full ではなく 4xl を使っているのは https://github.com/tailwindlabs/tailwindcss/discussions/7402
    let roundedClassName = ''
    if (rounded?.startTop) {
        roundedClassName += (rounded.startTop === 'small') ? 'rounded-ss-lg' : (rounded.startTop === 'medium') ? 'rounded-ss-xl' : 'rounded-ss-4xl'
        roundedClassName += ' '
    }
    if (rounded?.startBottom) {
        roundedClassName += (rounded.startBottom === 'small') ? 'rounded-es-lg' : (rounded.startBottom === 'medium') ? 'rounded-es-xl' : 'rounded-es-4xl'
        roundedClassName += ' '
    }
    if (rounded?.endTop) {
        roundedClassName += (rounded.endTop === 'small') ? 'rounded-se-lg' : (rounded.endTop === 'medium') ? 'rounded-se-xl' : 'rounded-se-4xl'
        roundedClassName += ' '
    }
    if (rounded?.endBottom) {
        roundedClassName += (rounded.endBottom === 'small') ? 'rounded-ee-lg' : (rounded.endBottom === 'medium') ? 'rounded-ee-xl' : 'rounded-ee-4xl'
        roundedClassName += ' '
    }
    // 何も指定がなかった場合
    if (!roundedClassName) {
        roundedClassName = 'rounded-full'
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
            {
                // 後ろにアイコンを出す
                endIcon && (
                    <IconParent
                        size={(size === 'small') ? 'small' : 'medium'}
                        className={iconColorClassName}
                    >
                        {endIcon}
                    </IconParent>
                )
            }
        </div>
    )

    /** variant に合わせたボタンを生成する */
    const createButton = () => {
        // JSX で switch 使うの、関数にしないとダメ？
        switch (nonNullVariant) {
            case 'text':
                return (
                    <button className={`text-content-primary-light dark:text-content-primary-dark cursor-pointer ${roundedClassName} ${commonClassName}`}>
                        {createButtonContent}
                    </button>
                )
            case 'outlined':
                return (
                    <button className={`border-2 border-content-primary-light text-content-text-light dark:text-content-text-dark cursor-pointer  ${roundedClassName} ${buttonAlpha}`}>
                        {createButtonContent}
                    </button>
                )
            case 'contained':
                return (
                    <button className={`bg-content-primary-light text-[#ffffff] cursor-pointer  ${roundedClassName} ${buttonAlpha}`}>
                        {createButtonContent}
                    </button>
                )
        }
    }

    return createButton()
}
