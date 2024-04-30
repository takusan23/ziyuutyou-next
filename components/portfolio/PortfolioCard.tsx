"use client" // onClick 、useState のため

import { useMemo, useState } from "react"
import { PortfolioData } from "../../src/data/PortfolioData"
import RoundedCornerBox from "../RoundedCornerBox"
import { PortfolioItem } from "./PortfolioItem"
import PortfolioTab from "./PortfolioTab"
import PortfolioDeck from "./PortfolioDeck"

/** PortfolioCard へ渡すデータ */
type PortfolioCardProps = {
    /** ポートフォリオ一覧 */
    portPolioDataList: PortfolioData[]
}

/**
 * 作品集
 * と言っているが、JSON の形式さえあっていれば別に作品集以外でも使えるので、汎用性はありそう。
 * JSON の形式はこれに沿ってやればいいと思う→{@link PortfolioData}
 */
export default function PortfolioCard({ portPolioDataList }: PortfolioCardProps) {

    // 今選択中のタブ
    // 初期値は最初のカテゴリで
    const [currentTabName, setCurrentTabName] = useState<string>(portPolioDataList[0].categoryName)

    /** タブ一覧。useMemo するほど重くないけど一応。  */
    const tabLabelList = useMemo(
        () => portPolioDataList.map((data) => data.categoryName),
        [portPolioDataList]
    )

    /** 選択中のタブに対応するアイテム一覧。 */
    const categoryItemList = useMemo(
        () => portPolioDataList.find((categoryData) => categoryData.categoryName === currentTabName)?.categoryItemList ?? [],
        [portPolioDataList, currentTabName]
    )

    /** その他のカテゴリで表示するやつ。選択中以外を返す */
    const portPolioDataListWithoutCurrentSelect = useMemo(
        () => portPolioDataList.filter((categoryData) => categoryData.categoryName !== currentTabName),
        [portPolioDataList, currentTabName]
    )

    return (
        <RoundedCornerBox rounded="large">
            <div className="p-4 space-y-4 flex flex-col">

                {/* タイトル */}
                <h2 className="text-2xl text-content-primary-light dark:text-content-primary-dark">
                    作品集
                </h2>

                {/* タブ */}
                <div className="flex flex-row flex-nowrap overflow-x-scroll items-center">
                    {
                        tabLabelList.map((label) => (
                            <PortfolioTab
                                key={label}
                                label={label}
                                isSelected={label === currentTabName}
                                onClick={() => setCurrentTabName(label)}
                            />
                        ))
                    }
                </div>

                {/* カテゴリの作品集一覧 */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {
                        categoryItemList.map((detailData) => (
                            <PortfolioItem
                                key={detailData.name}
                                name={detailData.name}
                                description={detailData.description}
                                link={detailData.link}
                                github={detailData.github}
                                image={detailData.image}
                            />
                        ))
                    }
                </div>

                {/* 横並びカラム */}
                <PortfolioDeck
                    portPolioDataListWithoutCurrentSelect={portPolioDataListWithoutCurrentSelect}
                    onMoreClick={setCurrentTabName}
                />

            </div>
        </RoundedCornerBox>
    )
}