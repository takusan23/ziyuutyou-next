import RoundedImage from "./RoundedImage"
import ThemeSettingMenu from "./ThemeSettingMenu"
import NavigationDrawerItem from "./NavigationDrawerItem"
import Icon from "./Icon"

/** ナビゲーションドロワーの表示先、パス、コンポーネント */
const DRAWER_LINK = [
    {
        title: 'ホーム',
        icon: <Icon iconStyle="mask-[url('/icon/home.svg')]" size="medium" color="currentColor" />,
        path: '/'
    },
    {
        title: '記事一覧',
        icon: <Icon iconStyle="mask-[url('/icon/book.svg')]" size="medium" color="currentColor" />,
        path: '/posts/page/1/'
    },
    {
        title: 'タグ一覧',
        icon: <Icon iconStyle="mask-[url('/icon/sell.svg')]" size="medium" color="currentColor" />,
        path: '/posts/tag/all_tags/'
    },
    {
        title: '記事検索',
        icon: <Icon iconStyle="mask-[url('/icon/search.svg')]" size="medium" color="currentColor" />,
        path: '/search/'
    },
    {
        title: 'このサイトについて',
        icon: <Icon iconStyle="mask-[url('/icon/bubble_chart.svg')]" size="medium" color="currentColor" />,
        path: '/pages/about/'
    }
]

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

            <nav>
                {
                    DRAWER_LINK.map(menu => (
                        <NavigationDrawerItem
                            key={menu.path}
                            title={menu.title}
                            icon={menu.icon}
                            path={menu.path}
                        />
                    ))
                }
            </nav>

            {/* 区切り線 */}
            <div className="border-b-2 my-2 mx-4 border-content-text-light dark:border-content-text-dark" />

            <ThemeSettingMenu />

        </div>
    )
}