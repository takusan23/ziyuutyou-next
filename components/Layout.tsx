import Box from '@mui/material/Box';
import React from "react";
import BlogTitleBar from "./BlogTitleBar"
import NavigationLinkDrawer from "./NavigationComponent"
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';

/**
 * ナビゲーションドロワーなどをすべてのページで表示するためにAppに置いて、共通化する
 * 
 * それぞれのページで置いちゃうとページ遷移のたびにリセットされてしまうので
 * 
 * JetpackComposeだとScaffold的な？
 */
const Layout = ({ children }) => {
    // ナビゲーションドロワーを開くかどうか。JetpackComposeの remember{ mutableStateOf(false) } みたいな
    const [isOpen, setOpen] = React.useState(false);

    // ドロワーの幅
    const drawerWidth = 240

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* 関数を引数に持つ感じ、JetpackComposeみたいでいいね */}
            <BlogTitleBar
                title="たくさんの自由帳"
                drawerWidth={drawerWidth}
                onDrawerMenuClick={() => setOpen(true)}
            />
            <NavigationLinkDrawer
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                drawerWidth={drawerWidth}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1, p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    )
}

export default Layout