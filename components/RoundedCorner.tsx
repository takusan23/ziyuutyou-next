import { ReactNode } from "react"

/** RoundedCornerBox へ渡すデータ */
type RoundedCornerBoxProps = {
    /** どれだけ丸くするか */
    value?: number
    /** 背景色。Tailwind CSS の色 */
    className?: string

    colorCode?: string
    /** 子要素 */
    children: ReactNode
}

/** 角丸なBox */
export default function RoundedCornerBox({ className, value, children }: RoundedCornerBoxProps) {
    const valueOrDefault = value ?? 3
    const colorOrDefault = className ?? 'bg-container-primary-light'

    return (
        <div className={`rounded-[${valueOrDefault}px] ${colorOrDefault}`}>
            {children}
        </div>
    )
}