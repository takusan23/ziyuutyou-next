import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import { AndroidOutlined, WebOutlined } from "@mui/icons-material"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Divider from "@mui/material/Divider"
import { useEffect, useState } from "react"
import Spacer from "./Spacer"

/** 作ったもの配列にあるデータの構造 */
type MakingAppItem = {
    title: string,
    description: string,
    link: string,
    github: string
}

/** 作ったもの。後でJSONとかから読み込めるようにする */
const makingApp = {
    android: [
        {
            title: "ちょこどろいど",
            description: "工事中...",
            link: "https://github.com/takusan23/ChocoDroid",
            github: "https://github.com/takusan23/Ziyuutyou"
        }
    ],
    web: [
        {
            title: "このサイト",
            description: "Next.js と Material UI でできている",
            link: "https://takusan.negitoro.dev/",
            github: "https://github.com/takusan23/Ziyuutyou"
        }
    ]
}

/** makingAppにはアイコン無いので */
const iconList = [
    <AndroidOutlined />,
    <WebOutlined />
]

/** MakingAppNavigationRail へ渡すデータ */
type MakingAppNavigationRailProps = {
    /** メニュー選択した際に呼ばれる。引数はandroidとかwebとかプラットフォームの名前 */
    onMenuClick: (platform: string) => void,
}

/** 作ったものを切り替えるNavigationRail */
const MakingAppNavigationRail: React.FC<MakingAppNavigationRailProps> = (props) => {
    return (
        <Box>
            <List>
                {Object.keys(makingApp).map((text, index) => (
                    <ListItem button key={text} onClick={() => props.onMenuClick(text)}>
                        <IconButton>
                            {iconList[index]}
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}

/** MakingAppList へ渡すデータ */
type MakingAppListProps = {
    /** 作ったもの配列 */
    list: Array<MakingAppItem>
}

/** 実際に作ったものを表示する */
const MakingAppList: React.FC<MakingAppListProps> = (props) => {
    return (
        <List sx={{ marginLeft: 2, marginRight: 2, width: '100%' }}>
            {
                props.list.map(item => (
                    <>
                        <Typography variant="h5" component="div">
                            {item.title}
                        </Typography>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary">
                            {item.description}
                        </Typography>
                        <Spacer value={1} />
                        <Button variant="text" size="small">リンクへ</Button>
                        <Button variant="text" size="small">GitHubを開く</Button>
                        <Divider />
                        <Spacer value={1} />
                    </>
                ))
            }
        </List>
    )
}

/** 作ったもの表示してるところ */
const MakingAppCard = () => {
    // JetpackComposeの remember { mutableStateOf(arrayOf()) } みたいな
    const [appList, setAppList] = useState(new Array<MakingAppItem>())

    /**
     * 作ったものリストを切り替える
     * 
     * Vueよりも関数書きやすいやん！
     * 
     * @param platformName androidとか
     */
    const changeAppListPlatform = (platformName: string) => {
        // あれTypeScriptくんこれ通すんか？
        setAppList(makingApp[platformName])
    }

    /**
     * 初期値を入れる
     * 
     * JetpackComposeの LaunchedEffect みたいなやつ
     */
    useEffect(() => {
        setAppList(makingApp["android"])
    }, [])

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3
            }}
        >
            <Typography variant="h6" sx={{ padding: 1 }}>
                作ったもの
            </Typography>
            <div style={{ display: 'flex' }}>
                <MakingAppNavigationRail
                    onMenuClick={platformName => changeAppListPlatform(platformName)}
                />
                <MakingAppList list={appList} />
            </div>
        </Paper>
    )
}

export default MakingAppCard