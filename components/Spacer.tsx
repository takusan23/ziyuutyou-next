/** Spacerへ渡す値 */
type SpacerProps = {
    /** どれぐらい開けるか @deprecated 消す */
    value?: number

    /** どれぐらい開けるか */
    space?: 'small' | 'medium' | 'large' // TODO non-null
}

/** 空白をあけるだけ */
export default function Spacer({ space }: SpacerProps) {
    let className: string
    switch (space ?? 'small') {
        case 'small':
            className = 'm-1'
            break
        case 'medium':
            className = 'm-3'
            break
        case 'large':
            className = 'm-5'
            break
    }

    return (
        <div className={className} />
    )
}