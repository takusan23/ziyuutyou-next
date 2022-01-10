import AndroidOutlined from "@mui/icons-material/AndroidOutlined"
import ComputerOutlined from "@mui/icons-material/ComputerOutlined"
import GridViewOutlined from "@mui/icons-material/GridViewOutlined"
import VideogameAssetOutlined from "@mui/icons-material/VideogameAssetOutlined"
import WebOutlined from "@mui/icons-material/WebOutlined" 
import Typography from "@mui/material/Typography"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import IconButton from "@mui/material/IconButton"
import React, { useEffect, useState } from "react"
import Spacer from "./Spacer"
import RoundedCornerBox from "./RoundedCorner"
import { MakingAppData, MakingAppDetailData } from "../src/data/MakingAppData"
import { Box, ListItemIcon, ListItemText, useMediaQuery, useTheme } from "@mui/material"
import NextLinkButton from "./NextLinkButton"

/** MakingAppNavigationRail へ渡すデータ */
type MakingAppNavigationRailProps = {
    /** プラットフォームの一覧とアイコンのMap */
    platformNameToIconMap: Map<string, JSX.Element>,
    /** メニュー選択した際に呼ばれる。引数はandroidとかwebとかプラットフォームの名前 */
    onMenuClick: (platform: string) => void,
}

/** プラットフォーム一覧 NavigationRail */
const MakingAppNavigationRail: React.FC<MakingAppNavigationRailProps> = (props) => {
    const isMobileDevice = useMediaQuery("(max-width:600px)")
    return (
        <>
            <Box>
                <List>
                    {/* Mapには Array#map がない？ */}
                    {Array.from(props.platformNameToIconMap).map(([text, iconElement]) => (
                        <ListItem button key={text} onClick={() => props.onMenuClick(text)}>
                            {!isMobileDevice ? (
                                <>
                                    <ListItemIcon>
                                        {iconElement}
                                    </ListItemIcon>
                                    <ListItemText>
                                        {text}
                                    </ListItemText>
                                </>
                            ) : (<IconButton>{iconElement}</IconButton>)}
                        </ListItem>
                    ))}
                </List>
            </Box>
        </>
    )
}

/** MakingAppList へ渡すデータ */
type MakingAppListProps = {
    /** 作ったもの配列 */
    list: Array<MakingAppDetailData>
}

/** 実際に作ったものを表示する */
const MakingAppList: React.FC<MakingAppListProps> = (props) => {
    const theme = useTheme()

    return (
        <List sx={{ marginLeft: 2, marginRight: 2, width: '100%' }}>
            {
                props.list.map(item => (
                    <RoundedCornerBox key={item.link} colorCode={theme.palette.background.default}>
                        <Box sx={{ padding: 2 }}>
                            <Typography variant="h5" component="div">
                                {item.name}
                            </Typography>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary">
                                {item.description}
                            </Typography>
                            <Spacer value={1} />
                            <NextLinkButton variant="text" href={item.link} text="リンクへ" />
                            <NextLinkButton variant="text" href={item.github} text="GitHubを開く" />
                        </Box>
                    </RoundedCornerBox>
                ))
            }
        </List>
    )
}

/** MakingAppData へ渡すデータ */
type MakingAppCardProps = {
    /** 作ったアプリの配列 */
    makingAppList: Array<MakingAppData>
}

/** 作ったもの表示してるところ */
const MakingAppCard: React.FC<MakingAppCardProps> = (props) => {
    const makingAppList = props.makingAppList

    // プラットフォームのアイコンと名前の配列をつくる
    const nameToIconMap = new Map([
        ["android", <AndroidOutlined />],
        ["web", <WebOutlined />],
        ["akashic", <VideogameAssetOutlined />],
        ["minecraft", <GridViewOutlined />],
        ["windows", <ComputerOutlined />]
    ])

    // JetpackComposeの remember { mutableStateOf(arrayOf()) } みたいな
    // 表示するプラットフォーム
    const [appList, setAppList] = useState(new Array<MakingAppDetailData>())

    /**
     * 作ったものリストを切り替える
     * 
     * Vueよりも関数書きやすいやん！
     * 
     * @param platformName androidとか
     */
    const changeAppListPlatform = (platformName: string) => {
        // あれTypeScriptくんこれ通すんか？
        setAppList(makingAppList.find(platformObj => platformObj.platfromName == platformName).appList)
    }

    /**
     * 初期値を入れる
     * 
     * JetpackComposeの LaunchedEffect みたいなやつ
     */
    useEffect(() => {
        changeAppListPlatform("android")
    }, [])

    return (
        <RoundedCornerBox value={3}>
            <Box sx={{ padding: 1 }}>
                <Typography variant="h5" sx={{ padding: 1, marginLeft: 1 }} color="primary">
                    作ったもの
                </Typography>
                <div style={{ display: 'flex' }}>
                    <MakingAppNavigationRail
                        platformNameToIconMap={nameToIconMap}
                        onMenuClick={platformName => changeAppListPlatform(platformName)}
                    />
                    <MakingAppList list={appList} />
                </div>
            </Box>
        </RoundedCornerBox>
    )
}

export default MakingAppCard