import { OpenInBrowserOutlined } from "@mui/icons-material"
import { IconButton, ListItem, ListItemButton, ListItemText, useTheme } from "@mui/material"
import Typography from "@mui/material/Typography"
import { Box } from "@mui/system"
import Link from "next/link"
import LinkData from "../src/data/LinkData"
import RoundedCornerBox from "./RoundedCorner"
import Spacer from "./Spacer"

/** LinkCard へ渡すデータ */
type LinkCardProps = {
    /** リンクのデータの配列 */
    linkList: Array<LinkData>
}

/** リンク集を表示する部分 */
const LinkCard: React.FC<LinkCardProps> = (props) => {
    const theme = useTheme()

    return (
        <>
            <RoundedCornerBox value={3}>
                <Box sx={{ padding: 1 }}>
                    <Typography variant="h5" sx={{ padding: 1, marginLeft: 1 }} color="primary">
                        リンク
                    </Typography>
                    <Typography sx={{ marginLeft: 2 }}>
                        Twitterが良いと思います
                    </Typography>
                    {
                        props.linkList.map((linkData) => (
                            <>
                                <RoundedCornerBox value={3} colorCode={theme.palette.background.default}>
                                    <Spacer value={1} />
                                    <ListItem
                                        disablePadding
                                        secondaryAction={<OpenInBrowserOutlined color="primary" />}>
                                        <Link href={linkData.href} passHref>
                                            <ListItemButton component="a">
                                                <ListItemText
                                                    primary={linkData.name}
                                                    secondary={linkData.description} />
                                            </ListItemButton>
                                        </Link>
                                    </ListItem>
                                </RoundedCornerBox>
                            </>
                        ))
                    }
                </Box>
            </RoundedCornerBox>
        </>
    )
}

export default LinkCard