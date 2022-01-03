import AppBar from "@mui/material/AppBar"
import IconButton from "@mui/material/IconButton"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography";
import MenuIcon from '@mui/icons-material/Menu';
import React from "react";

/** タイトルバーへ渡すデータ */
type BlogTitleBarProps = {
    /** タイトルバーの文字。ブログのタイトルとか */
    title: string,
    /** ドロワーの展開ボタンを押した際に呼ばれる */
    onDrawerMenuClick: () => void,
    /** ドロワーの幅 */
    drawerWidth?: number
}

/** タイトルバー */
const BlogTitleBar: React.FC<BlogTitleBarProps> = (props) => {
    const drawerWidth = props.drawerWidth ?? 240

    return (
        <AppBar
            color="inherit"
            position="absolute"
            sx={{
                backgroundColor: "transparent",
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
            }}
            elevation={0}
        >
            <Toolbar>
                <IconButton
                    sx={{ mr: 2, display: { sm: 'none' } }}
                    onClick={props.onDrawerMenuClick}
                >
                    <MenuIcon color="primary" />
                </IconButton>
                <Typography
                    variant="h5"
                    color="primary.main"
                >
                    {props.title}
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default BlogTitleBar