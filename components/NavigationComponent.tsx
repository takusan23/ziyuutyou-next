import BookRounded from "@mui/icons-material/BookRounded"
import BubbleChartOutlined from "@mui/icons-material/BubbleChartOutlined"
import HomeOutlined from "@mui/icons-material/HomeOutlined"
import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined"
import Box from "@mui/material/Box"
import CardHeader from "@mui/material/CardHeader"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Link from "next/link"
import DarkmodeSwitch from "./DarkmodeSwitch"
import NextAvater from "./NextAvater"

/** ナビゲーションドロワーに表示するメニュー */
const linkList = [
    {
        title: "トップページ",
        link: "/",
        icon: <HomeOutlined />
    },
    {
        title: "記事一覧",
        link: "/posts/page/1/",
        icon: <BookRounded />
    },
    {
        title: "タグ一覧",
        link: "/posts/tag/all_tags/",
        icon: <LocalOfferOutlined />
    },
    {
        title: "このサイトについて",
        link: "/pages/about/",
        icon: <BubbleChartOutlined />
    },
]

/** ナビゲーション一覧コンポーネント */
const NavigationLink = () => {
    return (
        <Box>
            <List>
                {
                    // mapでElementを返す
                    linkList.map(linkData => (
                        <Link
                            style={{
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                            href={linkData.link}
                            key={linkData.link}
                        >
                            <ListItemButton>
                                <ListItemIcon>{linkData.icon}</ListItemIcon>
                                <ListItemText primary={linkData.title} />
                            </ListItemButton>
                        </Link>
                    ))
                }
            </List>
        </Box>
    )
}

/** ナビゲーションのヘッダー */
const NavigationHeader = () => {
    return (<CardHeader
        avatar={
            <NextAvater path="/icon.png" />
        }
        title="たくさんの自由帳"
        subheader="Androidのお話"
    />)
}

/** ナビゲーションドロワー表示のためのデータ */
type NavigationLinkDrawerProps = {
    /** 表示する場合はtrue */
    isOpen: boolean,
    /** 閉じる際に呼ばれる */
    onClose: () => void,
    /** ドロワーの幅。かえたければ */
    drawerWidth?: number,
    /** ダークモードかどうか */
    isDarkmode: boolean,
    /** スイッチ切り替えたら呼ばれる */
    onDarkmodeChange: (boolean) => void,
}

/**
 * 横のナビゲーションドロワー
 */
const NavigationLinkDrawer: React.FC<NavigationLinkDrawerProps> = (props) => {
    // ドロワーの幅
    const drawerWidth = props.drawerWidth ?? 240

    // ドロワーに表示するコンテンツ
    const drawerContnets = (
        <>
            <NavigationHeader />
            <DarkmodeSwitch
                isDarkmode={props.isDarkmode}
                onChange={props.onDarkmodeChange}
            />
            <NavigationLink />
        </>
    )

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="links"
        >
            <Drawer
                open={props.isOpen}
                onClose={props.onClose}
                variant="temporary"
                elevation={0}
                sx={{
                    backgroundColor: "initial !important",
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        backgroundColor: 'background.default'
                    },
                }}
            >
                {drawerContnets}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        backgroundColor: 'background.default',
                        borderRight: 'initial'
                    },
                }}
                elevation={0}
                open
            >
                {drawerContnets}
            </Drawer>
        </Box>
    )
}

export default NavigationLinkDrawer