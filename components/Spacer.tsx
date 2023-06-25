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
            className = 'm-2'
            break
        case 'medium':
            className = 'm-5'
            break
        case 'large':
            className = 'm-7'
            break
    }

    return (
        <div className={className} />
    )
}