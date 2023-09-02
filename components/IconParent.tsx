import { ReactNode } from "react"

/** IconParent に渡すデータ */
type IconParentProps = {
    /** 色をオーバーライドするなら */
    className?: string
    /** サイズ */
    size?: 'small' | 'medium' | 'large'
    /** 子要素。アイコンをここに入れる */
    children: ReactNode
}

/** アイコンを置く親。サイズとテーマに合わせた色にする */
export default function IconParent({ className, size, children }: IconParentProps) {
    const colorClassName = className ?? 'fill-content-text-light dark:fill-content-text-dark'

    let sizeClassName: string
    switch (size ?? 'medium') {
        case 'small':
            sizeClassName = 'w-5 h-5'
            break;
        case 'medium':
            sizeClassName = 'w-7 h-7'
            break;
        case 'large':
            sizeClassName = 'w-10 h-10'
            break;
    }

    // なんか flex にしないとはみ出しちゃう
    return (
        <div className={`${sizeClassName} ${colorClassName} flex items-center justify-center`}>
            {children}
        </div>
    )
}