import { ReactNode, useMemo } from "react"
import AndroidIcon from "../../public/icon/android.svg"
import WebIcon from "../../public/icon/web.svg"
import VideoGameAssetIcon from "../../public/icon/videogame_asset.svg"
import GridIcon from "../../public/icon/grid_view.svg"
import LaptopIcon from "../../public/icon/laptop_windows.svg"
import IconParent from "../IconParent"

/** カテゴリとアイコンの対応表の型 */
type IconDictionary = {
    /** カテゴリ名 */
    categoryName: string
    /** アイコン */
    iconElement: ReactNode
}

/** カテゴリ名に対応したアイコン一覧 */
const CATEGORY_NAME_ICON_DICTIONARY: IconDictionary[] = [
    { categoryName: "android", iconElement: <AndroidIcon /> },
    { categoryName: "web", iconElement: <WebIcon /> },
    { categoryName: "akashic", iconElement: <VideoGameAssetIcon /> },
    { categoryName: "minecraft", iconElement: <GridIcon /> },
    { categoryName: "windows", iconElement: <LaptopIcon /> }
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
        <>
            {
                iconElement && <IconParent>
                    {iconElement}
                </IconParent>
            }
        </>
    )
}