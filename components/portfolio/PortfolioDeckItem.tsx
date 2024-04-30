import Link from "next/link"
import { PortfolioDetailData } from "../../src/data/PortfolioData"
import IconParent from "../IconParent"
import ExpandMoreIcon from "../../public/icon/expand_more.svg"
import CategoryNameIconDictionary from "./CategoryNameIconDictionary"

/** PortfolioDetailData へ渡すデータ。PortfolioDetailData にアイコンの名前を追加 */
type PortfolioOtherDeckItemProps = {
    /** カテゴリ名。アイコン表示で使う */
    caterogyName: string
} & PortfolioDetailData

/**
 * 他のカテゴリでリスト表示している各アイテム。
 * Android のクイック設定みたいなやつ。
 */
export default function PortfolioOtherDeckItem({ name, description, link, caterogyName }: PortfolioOtherDeckItemProps) {
    return (
        <Link href={link}>
            <div className="flex flex-row p-3 space-x-2 rounded-3xl bg-background-light dark:bg-background-dark">

                <div className="flex items-center">
                    <CategoryNameIconDictionary categoryName={caterogyName} />
                </div>

                <div className="grow overflow-hidden">
                    <h3 className="truncate text-content-primary-light dark:text-content-primary-dark text-xl">
                        {name}
                    </h3>
                    <p className="text-content-text-light dark:text-content-text-dark text-base">
                        {description}
                    </p>
                </div>

                <div className="flex items-center">
                    <IconParent>
                        <ExpandMoreIcon className="-rotate-90" />
                    </IconParent>
                </div>
            </div>
        </Link>
    )
}