"use client"

import { Fragment, ReactNode, useEffect, useState } from "react"
import Spacer from "./Spacer"
import RoundedCornerBox from "./RoundedCorner"
import { MakingAppData, MakingAppDetailData } from "../src/data/MakingAppData"
import NextLinkButton from "./NextLinkButton"
import HomeIcon from "../public/icon/material-home.svg"
import RoundedCornerList from "./RoundedCornerList"

/** 名前とアイコンの型 */
type PlatformData = {
    /** プラットフォーム名。android とか */
    name: string
    /** アイコン */
    icon: ReactNode
}

/** MakingAppNavigationRail へ渡すデータ */
type MakingAppNavigationRailProps = {
    /** プラットフォームの一覧とアイコンのMap */
    platformNameToIconMap: PlatformData[],
    /** メニュー選択した際に呼ばれる。引数はandroidとかwebとかプラットフォームの名前 */
    onMenuClick: (platform: string) => void,
}

/** プラットフォーム一覧 NavigationRail */
function MakingAppNavigationRail({ platformNameToIconMap, onMenuClick }: MakingAppNavigationRailProps) {
    // const isMobileDevice = useMediaQuery("(max-width:600px)")

    return (
        <>
            {
                platformNameToIconMap.map(({ name, icon }) => (
                    <div
                        className="flex flex-row items-center p-5 cursor-pointer"
                        key={name}
                        onClick={() => onMenuClick(name)}
                    >
                        <div className="sm:mr-2">{icon}</div>
                        <p className="hidden sm:block">{name}</p>
                    </div>
                ))
            }
        </>
    )
}

/** MakingAppList へ渡すデータ */
type MakingAppListProps = {
    /** 作ったもの配列 */
    list: MakingAppDetailData[]
}

/** 実際に作ったものを表示する */
function MakingAppList({ list }: MakingAppListProps) {
    return (
        <RoundedCornerList
            list={list}
            content={(className, item) => (
                <div
                    className={`p-3 bg-background-light ${className}`}
                    key={item.link}
                >
                    <h3 className="text-2xl text-content-text-light">
                        {item.name}
                    </h3>
                    <p className="text-content-text-light">
                        {item.description}
                    </p>
                    <Spacer space="small" />
                    <div className="flex flex-row">
                        <NextLinkButton
                            variant="text"
                            href={item.link}
                            text="リンクへ"
                        />
                        <Spacer space="small" />
                        <NextLinkButton
                            variant="text"
                            href={item.github}
                            text="GitHubを開く"
                        />
                    </div>
                </div>
            )}
        />
    )
}

// プラットフォームのアイコンと名前の配列をつくる
const APP_NAME_TO_ICON_LIST: PlatformData[] = [
    { name: "android", icon: <HomeIcon className="w-5 h-5" /> },
    { name: "web", icon: <HomeIcon className="w-5 h-5" /> },
    { name: "akashic", icon: <HomeIcon className="w-5 h-5" /> },
    { name: "minecraft", icon: <HomeIcon className="w-5 h-5" /> },
    { name: "windows", icon: <HomeIcon className="w-5 h-5" /> },
]

/** MakingAppData へ渡すデータ */
type MakingAppCardProps = {
    /** 作ったアプリの配列 */
    makingAppList: Array<MakingAppData>
}

/** 作ったもの表示してるところ */
export default function MakingAppCard({ makingAppList }: MakingAppCardProps) {
    // JetpackComposeの remember { mutableStateOf(arrayOf()) } みたいな
    // 表示するプラットフォーム
    const [appList, setAppList] = useState<MakingAppDetailData[]>([])

    /**
     * 作ったものリストを切り替える
     * Vueよりも関数書きやすいやん！
     * 
     * @param platformName androidとか
     */
    const changeAppListPlatform = (platformName: string) => {
        const makingApp = makingAppList.find(platformObj => platformObj.platfromName === platformName)
        if (makingApp) {
            setAppList(makingApp.appList)
        }
    }

    // 初期値を入れる
    // JetpackComposeの LaunchedEffect みたいなやつ
    useEffect(() => {
        changeAppListPlatform("android")
    }, [])

    return (
        <RoundedCornerBox rounded="large">
            <div className="pt-3">
                <h2 className="text-2xl px-3 text-content-primary-light">
                    作ったもの
                </h2>
                <div className="flex flex-row py-2">
                    <div>
                        <MakingAppNavigationRail
                            platformNameToIconMap={APP_NAME_TO_ICON_LIST}
                            onMenuClick={platformName => changeAppListPlatform(platformName)}
                        />
                    </div>
                    <div className="flex flex-col grow px-2">
                        <MakingAppList list={appList} />
                    </div>
                </div>
            </div>
        </RoundedCornerBox>
    )
}