/** Spacerへ渡す値 */
type SpacerProps = {
    /** どれぐらい開けるか */
    value: number
}

/** 空白をあけるだけ */
export default function Spacer({ value }: SpacerProps) {
    return (
        <div className={`m-[${value}px]`} />
    )
}