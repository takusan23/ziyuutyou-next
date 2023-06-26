import { ReactNode } from "react"

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

    /** ボタンの中身を作成する */
    const createButtonContent = (
        <div className={`flex flex-row items-center space-x-2 ${buttonPaddingClassName}`}>
            {startIcon}
            <p>{text}</p>
        </div>
    )

    /** variant に合わせたボタンを生成する */
    const createButton = () => {
        // JSX で switch 使うの、関数にしないとダメ？
        switch (variant ?? 'contained') {
            case 'text':
                return (
                    <div className={`rounded-full text-content-primary-light ${commonClassName}`}>
                        {createButtonContent}
                    </div>
                )
            case 'outlined':
                return (
                    <div className={`rounded-full border-2 border-content-primary-light ${buttonAlpha}`}>
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
