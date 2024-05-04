import { ReactNode } from "react"
import Link from "next/link"
import RoundedImage from "./RoundedImage"
import DarkmodeSwitch from "./DarkmodeSwitch"
import IconParent from "./IconParent"
import HomeIcon from "../public/icon/home.svg"
import BookIcon from "../public/icon/book.svg"
import SellIcon from "../public/icon/sell.svg"
import SearchIcon from "../public/icon/search.svg"
import BubbleChart from "../public/icon/bubble_chart.svg"

/** ナビゲーションドロワーの表示先、パス、コンポーネント */
const DRAWER_LINK: NavigationDrawerItemProps[] = [
    {
        title: 'ホーム',
        icon: <HomeIcon />,
        path: '/'
    },
    {
        title: '記事一覧',
        icon: <BookIcon />,
        path: '/posts/page/1/'
    },
    {
        title: 'タグ一覧',
        icon: <SellIcon />,
        path: '/posts/tag/all_tags/'
    },
    {
        title: '記事検索',
        icon: <SearchIcon />,
        path: '/search/'
    },
    {
        title: 'このサイトについて',
        icon: <BubbleChart />,
        path: '/pages/about/'
    }
]

/** NavigationDraweItem へ渡すデータ */
type NavigationDrawerItemProps = {
    /** テキスト */
    title: string
    /** アイコン */
    icon: ReactNode
    /** 遷移先パス */
    path: string
    /** 利用できない場合は true */
    isHide?: boolean
}

/** ナビゲーションドロワーの各メニュー */
function NavigationDrawerItem({ title, icon, path }: NavigationDrawerItemProps) {
    return (
        <Link href={path}>
            <div className="flex flex-row p-3 items-center space-x-4 rounded-xl hover:bg-hover-light dark:hover:bg-hover-dark select-none cursor-pointer">
                <IconParent>
                    {icon}
                </IconParent>
                <p className="text-content-text-light dark:text-content-text-dark text-base">
                    {title}
                </p>
            </div>
        </Link>
    )
}

/** ナビゲーションドロワー */
export default function NavigationDrawer() {
    return (
        <div className="flex flex-col p-2 w-full">

            <div className="flex flex-row p-2 items-center">
                <RoundedImage src="/icon.png" />
                <div className="flex flex-col text-content-text-light">
                    <p className="text-content-text-light dark:text-content-text-dark text-base">
                        たくさんの自由帳
                    </p>
                    <p className="text-content-text-light dark:text-content-text-dark text-sm">
                        Androidのお話
                    </p>
                </div>
            </div>

            <DarkmodeSwitch />

            <nav>
                {
                    DRAWER_LINK
                        .filter(menu => !menu.isHide)
                        .map(menu => (
                            <NavigationDrawerItem
                                key={menu.path}
                                title={menu.title}
                                icon={menu.icon}
                                path={menu.path}
                            />
                        ))
                }
            </nav>
        </div>
    )
}