import { Box, useTheme } from "@mui/material"

/** RoundedCorner へ渡すデータ */
type RoundedCornerProps = {
    /** どれだけ丸くするか */
    value?: number,
    /** 色。カラーコードで。省略時 <Papger> の BackgroundColor */
    colorCode?: string,
    /** 子要素 */
    children: React.ReactNode
}

/** 角丸なBox */
const RoundedCornerBox: React.FC<RoundedCornerProps> = ({ children, ...props }) => {
    const theme = useTheme()
    const backgroundColor = props.colorCode ?? theme.palette.background.paper
    return (
        <Box
            sx={{
                borderRadius: props.value ?? 3,
                backgroundColor: backgroundColor
            }}
        >
            {children}
        </Box>
    )
}

export default RoundedCornerBox