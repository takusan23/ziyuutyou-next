import Box from "@mui/material/Box"

/** Spacerへ渡す値 */
type SpacerProps = {
    /** どれぐらい開けるか */
    value: number
}

/** 空白をあけるだけ */
const Spacer: React.FC<SpacerProps> = (props) => {
    return (
        <Box sx={{ margin: props.value }} />
    )
}

export default Spacer