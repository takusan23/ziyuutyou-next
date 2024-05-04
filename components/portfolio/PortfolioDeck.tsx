"use client"

import Button from "../Button"
import PortfolioOtherDeckItem from "./PortfolioDeckItem"
import { PortfolioData } from "../../src/data/PortfolioData"
import NorthEastIcon from "../../public/icon/north_east.svg"

/** PortfolioOtherDeck へ渡すデータ */
type PortfolioOtherContainerProps = {
    /** 表示するデータ */
    portPolioDataListWithoutCurrentSelect: PortfolioData[]
    /** くわしく押したとき */
    onMoreClick: (categoryName: string) => void
}

/** PortfolioOtherDeckColumn へ渡すデータ */
type PortfolioOtherDeckColumnProps = {
    /** カラムに表示するデータ */
    portfolioData: PortfolioData,
    /** くわしく押したとき */
    onMoreClick: (categoryName: string) => void
}

/** PortfolioOtherDeck の各カラム */
function PortfolioOtherDeckColumn({ portfolioData, onMoreClick }: PortfolioOtherDeckColumnProps) {
    return (
        <div className="flex flex-col space-y-4 min-w-80 max-w-80">

            {/* タイトル部分 */}
            <h3 className="text-xl text-content-primary-light dark:text-content-primary-dark">
                {portfolioData.categoryName}
            </h3>

            {/* 各アイテム */}
            {
                portfolioData.categoryItemList.map((categoryItem) => (
                    <PortfolioOtherDeckItem
                        key={categoryItem.link}
                        name={categoryItem.name}
                        description={categoryItem.description}
                        link={categoryItem.link}
                        github={categoryItem.github}
                        image={categoryItem.image}
                        caterogyName={portfolioData.categoryName} />
                ))
            }

            {/* くわしくボタン */}
            <div className="flex justify-center">
                <div onClick={() => onMoreClick(portfolioData.categoryName)}>
                    <Button
                        text="くわしく"
                        variant="outlined"
                        size="small"
                        endIcon={<NorthEastIcon />} />
                </div>
            </div>

        </div>
    )
}

/** 他のカテゴリを表示するやつ。Misskey の Deck みたいにマルチカラムみたいなやつ */
export default function PortfolioDeck({ portPolioDataListWithoutCurrentSelect, onMoreClick }: PortfolioOtherContainerProps) {
    return (
        <div className="flex flex-col">

            {/* タイトル */}
            <h2 className="text-2xl text-content-primary-light dark:text-content-primary-dark">
                こちらもどうぞ
            </h2>

            {/* カラムを並べる */}
            <div className="flex flex-row py-2 space-x-4 overflow-x-scroll">
                {
                    portPolioDataListWithoutCurrentSelect.map((portfolioData) => (
                        <PortfolioOtherDeckColumn
                            key={portfolioData.categoryName}
                            portfolioData={portfolioData}
                            onMoreClick={onMoreClick}
                        />
                    ))
                }
            </div>
        </div>
    )
}