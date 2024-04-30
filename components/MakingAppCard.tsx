"use client"

import { ReactNode, useEffect, useState } from "react"
import Spacer from "./Spacer"
import RoundedCornerBox from "./RoundedCornerBox"
import { PortfolioData, PortfolioDetailData } from "../src/data/PortfolioData"
import NextLinkButton from "./NextLinkButton"
import RoundedCornerList from "./RoundedCornerList"
import IconParent from "./IconParent"
import AndroidIcon from "../public/icon/android.svg"
import WebIcon from "../public/icon/web.svg"
import VideoGameAssetIcon from "../public/icon/videogame_asset.svg"
import GridIcon from "../public/icon/grid_view.svg"
import LaptopIcon from "../public/icon/laptop_windows.svg"

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
    return (
        <div className="flex flex-col space-y-3">
            {
                platformNameToIconMap.map(({ name, icon }) => (
                    <div
                        className="flex flex-row items-center cursor-pointer p-2 rounded-xl hover:bg-hover-light dark:hover:bg-hover-dark"
                        key={name}
                        onClick={() => onMenuClick(name)}
                    >
                        <div className="sm:mr-2">
                            <IconParent>
                                {icon}
                            </IconParent>
                        </div>
                        <p className="text-content-text-light dark:text-content-text-dark hidden sm:block">{name}</p>
                    </div>
                ))
            }
        </div>
    )
}

/** MakingAppList へ渡すデータ */
type MakingAppListProps = {
    /** 作ったもの配列 */
    list: PortfolioDetailData[]
}

/** 実際に作ったものを表示する */
function MakingAppList({ list }: MakingAppListProps) {
    return (
        <RoundedCornerList
            list={list}
            content={(className, item) => (
                <div
                    className={`p-3 bg-background-light dark:bg-background-dark ${className}`}
                    key={item.link}
                >
                    <h3 className="text-content-primary-light dark:text-content-primary-dark text-2xl">
                        {item.name}
                    </h3>
                    <p className="text-content-text-light dark:text-content-text-dark">
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
                        {
                            item.github && <NextLinkButton
                                variant="text"
                                href={item.github}
                                text="GitHubを開く"
                            />
                        }
                    </div>
                </div>
            )}
        />
    )
}

// プラットフォームのアイコンと名前の配列をつくる
const APP_NAME_TO_ICON_LIST: PlatformData[] = [
    { name: "android", icon: <AndroidIcon /> },
    { name: "web", icon: <WebIcon /> },
    { name: "akashic", icon: <VideoGameAssetIcon /> },
    { name: "minecraft", icon: <GridIcon /> },
    { name: "windows", icon: <LaptopIcon /> }
]

/** MakingAppData へ渡すデータ */
type MakingAppCardProps = {
    /** 作ったアプリの配列 */
    makingAppList: Array<PortfolioData>
}

/** 作ったもの表示してるところ */
export default function MakingAppCard({ makingAppList }: MakingAppCardProps) {
    // JetpackComposeの remember { mutableStateOf(arrayOf()) } みたいな
    // 表示するプラットフォーム
    const [appList, setAppList] = useState<PortfolioDetailData[]>([])

    /**
     * 作ったものリストを切り替える
     * Vueよりも関数書きやすいやん！
     * 
     * @param platformName androidとか
     */
    const changeAppListPlatform = (platformName: string) => {
        const makingApp = makingAppList.find(platformObj => platformObj.categoryName === platformName)
        if (makingApp) {
            setAppList(makingApp.categoryItemList)
        }
    }

    // 初期値を入れる
    // JetpackComposeの LaunchedEffect みたいなやつ
    useEffect(() => {
        changeAppListPlatform("android")
    }, [])

    return (
        <RoundedCornerBox rounded="large">
            <div className="p-3">
                <h2 className="text-2xl text-content-primary-light dark:text-content-primary-dark">
                    作ったもの
                </h2>
                <div className="flex flex-row py-2">
                    <MakingAppNavigationRail
                        platformNameToIconMap={APP_NAME_TO_ICON_LIST}
                        onMenuClick={platformName => changeAppListPlatform(platformName)}
                    />
                    <div className="flex flex-col grow px-2">
                        <MakingAppList list={appList} />
                    </div>
                </div>
            </div>
        </RoundedCornerBox>
    )
}