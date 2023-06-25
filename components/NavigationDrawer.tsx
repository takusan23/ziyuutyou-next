import { ReactNode } from "react"
import Link from "next/link"
import HomeIcon from "../public/icon/material-home.svg"
import RoundedImage from "./RoundedImage"
import Spacer from "./Spacer"

/** ナビゲーションドロワーの表示先、パス、コンポーネント */
const DRAWER_LINK: NavigationDrawerItemProps[] = [
    {
        title: 'ホーム',
        icon: <HomeIcon className="w-6 h-6 mr-5" />,
        path: '/'
    },
    {
        title: '記事一覧',
        icon: <HomeIcon className="w-6 h-6 mr-5" />,
        path: '/posts/page/1/'
    },
    {
        title: 'タグ一覧',
        icon: <HomeIcon className="w-6 h-6 mr-5" />,
        path: '/posts/tag/all_tags/'
    },
    {
        title: '検索（ベータ）',
        icon: <HomeIcon className="w-6 h-6 mr-5" />,
        path: '/search/'
    },
    {
        title: 'このサイトについて',
        icon: <HomeIcon className="w-6 h-6 mr-5" />,
        path: '/pages/about/'
    },
]

/** NavigationDraweItem へ渡すデータ */
type NavigationDrawerItemProps = {
    /** テキスト */
    title: string
    /** アイコン */
    icon: ReactNode
    /** 遷移先パス */
    path: string
}

/** ナビゲーションドロワーの各メニュー */
function NavigationDrawerItem({ title, icon, path }: NavigationDrawerItemProps) {
    return (
        <Link href={path}>
            <div className="flex flex-row p-3 items-center text-content-text-light">
                {icon}
                <p className="text-base">{title}</p>
            </div>
        </Link>
    )
}

/** ナビゲーションドロワー */
export default function NavigationDrawer() {
    return (
        <div className="flex flex-col pl-2 pr-2 w-[250px]">

            <Spacer space="small" />

            <div className="flex flex-row p-2 items-center">
                <RoundedImage src="/icon.png" />
                <div className="flex flex-col text-content-text-light">
                    <p className="text-base">たくさんの自由帳</p>
                    <p className="text-sm">Androidのお話</p>
                </div>
            </div>

            <Spacer space="small" />

            <nav>
                {
                    DRAWER_LINK.map(props => (
                        <NavigationDrawerItem
                            key={props.path}
                            title={props.title}
                            icon={props.icon}
                            path={props.path}
                        />
                    ))
                }
            </nav>
        </div>
    )
}