import { ReactNode, useMemo } from "react"
import Icon from "../Icon"

/** カテゴリとアイコンの対応表の型 */
type IconDictionary = {
    /** カテゴリ名 */
    categoryName: string
    /** アイコン */
    iconElement: ReactNode
}

/** カテゴリ名に対応したアイコン一覧 */
const CATEGORY_NAME_ICON_DICTIONARY: IconDictionary[] = [
    { categoryName: "android", iconElement: <Icon iconStyle="mask-[url('/icon/android.svg')]" size="medium" color="theme" /> },
    { categoryName: "web", iconElement: <Icon iconStyle="mask-[url('/icon/web.svg')]" size="medium" color="theme" /> },
    { categoryName: "akashic", iconElement: <Icon iconStyle="mask-[url('/icon/videogame_asset.svg')]" size="medium" color="theme" /> },
    { categoryName: "minecraft", iconElement: <Icon iconStyle="mask-[url('/icon/grid_view.svg')]" size="medium" color="theme" /> },
    { categoryName: "windows", iconElement: <Icon iconStyle="mask-[url('/icon/laptop_windows.svg')]" size="medium" color="theme" /> }
]

/** CategoryNameIconDictionary へ渡すデータ */
type CategoryNameIconDictionaryProps = {
    /** カテゴリ名 */
    categoryName: string
}

/** カテゴリ名に対応したアイコンを表示するやつ */
export default function CategoryNameIconDictionary({ categoryName }: CategoryNameIconDictionaryProps) {

    // アイコン
    const iconElement = useMemo(
        () => CATEGORY_NAME_ICON_DICTIONARY.find((entry) => entry.categoryName === categoryName)?.iconElement,
        [categoryName]
    )

    return (
        <>{iconElement}</>
    )
}