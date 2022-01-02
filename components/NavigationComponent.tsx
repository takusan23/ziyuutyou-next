import { BookRounded, BubbleChartOutlined, HomeOutlined } from "@mui/icons-material"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import CardHeader from "@mui/material/CardHeader"
import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Link from "next/link"
import Image from 'next/image'

/** ナビゲーションドロワーに表示するメニュー */
const linkList = [
    {
        title: "トップページ",
        link: "/",
        icon: <HomeOutlined />
    },
    {
        title: "記事一覧",
        link: "/posts/page/1",
        icon: <BookRounded />
    },
    {
        title: "このサイトについて",
        link: "/pages/about",
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
                        <Link href={linkData.link} passHref key={linkData.link}>
                            <ListItem button>
                                <ListItemIcon>{linkData.icon}</ListItemIcon>
                                <ListItemText primary={linkData.title} />
                            </ListItem>
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
            // Next.jsのImageを利用することでページ遷移時でもパスを自動で修正してくれる
            <Avatar alt="takusan_23">
                <Image src="/icon.png" layout="fill" />
            </ Avatar>
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
    drawerWidth?: number,
}

/**
 * 横のナビゲーションドロワー
 */
const NavigationLinkDrawer: React.FC<NavigationLinkDrawerProps> = (props) => {
    // ドロワーの幅
    const drawerWidth = props.drawerWidth ?? 240
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
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                <NavigationHeader />
                <Divider />
                <NavigationLink />
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                <NavigationHeader />
                <Divider />
                <NavigationLink />
            </Drawer>
        </Box>
    )
}

export default NavigationLinkDrawer