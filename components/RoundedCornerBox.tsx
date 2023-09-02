import { ReactNode } from "react"

/** RoundedCornerBox へ渡すデータ */
type RoundedCornerBoxProps = {
    /** どれだけ丸くするか */
    rounded?: 'small' | 'medium' | 'large'
    /** Tailwind CSS のクラス名 */
    className?: string
    /** 子要素 */
    children: ReactNode
}

/** 角丸なBox */
export default function RoundedCornerBox({ className, rounded, children }: RoundedCornerBoxProps) {
    // 変数埋め込みとかは使えない
    // https://tailwindcss.com/docs/content-configuration#class-detection-in-depth
    const colorOrDefault = className ?? 'bg-container-primary-light dark:bg-container-primary-dark'
    let roundedClassName: string
    switch (rounded ?? 'small') {
        case 'small':
            roundedClassName = 'rounded-md'
            break
        case 'medium':
            roundedClassName = 'rounded-xl'
            break
        case 'large':
            roundedClassName = 'rounded-3xl'
            break
    }

    return (
        <div className={`${roundedClassName} ${colorOrDefault}`}>
            {children}
        </div>
    )
}