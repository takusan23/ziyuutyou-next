import { ReactNode } from "react"

/** RoundedCornerBox へ渡すデータ */
type RoundedCornerBoxProps = {
    /** どれだけ丸くするか */
    value?: number,
    /** 色。カラーコードで。省略時 <Papger> の BackgroundColor */
    colorCode?: string,
    /** 子要素 */
    children: ReactNode
}

/** 角丸なBox */
export default function RoundedCornerBox({ colorCode, value, children }: RoundedCornerBoxProps) {
    const valueOrDefault = value ?? 3

    return (
        <div className={`rounded-[${valueOrDefault}px] bg-container-primary-light`}>
            {children}
        </div>
    )
}