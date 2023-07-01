import { ReactNode } from "react"
import Link from "next/link"
import TocData from "../src/data/TocData"
import RoundedCornerBox from "./RoundedCorner"

// 定数
const TOC_LIST_WIDTH = 'w-[300px]'
const MASTER_WIDTH = 'w-full lg:w-[calc(100%-300px)]'

/** TocList へ渡すデータ */
type TocListProps = {
    /** 目次の配列 */
    tocDataList: TocData[]
}

/** TocListLayout へ渡すデータ */
type TocListLayoutProps = {
    /** セカンダリー コンポーネント。これが目次になる */
    secondary: ReactNode
    /** マスター コンポーネント */
    children: ReactNode
}

/** 目次を表示する */
export function TocList({ tocDataList }: TocListProps) {
    // 目次の階層をわかりやすくするため、h1 ~ h6 に対応した className を出す
    const calcPaddingLeft = (index: number) => {
        // tailwind css は名前が完成していないとダメ（変数埋め込みとかは申し訳ないが NG ）
        switch (index) {
            case 1: return 'pl-4'
            case 2: return 'pl-6'
            case 3: return 'pl-8'
            case 4: return 'pl-10'
            case 5: return 'pl-12'
            case 6: return 'pl-14'
            default: return 'pl-1'
        }
    }

    // 目次にスクロールバーを出す
    return (
        <ul className={`space-y-2 py-4 overflow-auto h-screen`}>
            {
                tocDataList.map((tocData, index) => (
                    <li
                        key={index}
                        className={calcPaddingLeft(tocData.level)}
                    >
                        <Link
                            className="no-underline text-content-primary-light dark:text-content-primary-dark"
                            href={tocData.hashTag}
                        >
                            <p className="text-content-primary-light dark:text-content-primary-dark ">
                                {tocData.label}
                            </p>
                        </Link>
                    </li>
                ))
            }
        </ul>
    )
}

/**
 * 画面の幅が広いときだけ横に目次を出すレイアウト。
 * 目次なのでセカンダリーコンポーネントはスクロール時に追従するCSSをセットしてあります。
 */
export function TocListLayout({ children, secondary }: TocListLayoutProps) {
    return (
        <div className="flex flex-row">

            {/* 記事表示 */}
            <div className={MASTER_WIDTH}>
                {children}
            </div>

            {/* 横幅がある程度あれば目次を横に表示 ( 横幅があれば flex にする ) */}
            <div className={`flex-col sticky top-0 self-start hidden ${TOC_LIST_WIDTH} lg:flex`}>
                <RoundedCornerBox
                    rounded="large"
                    className="ml-2 bg-container-secondary-light dark:bg-container-secondary-dark"
                >
                    {secondary}
                </RoundedCornerBox>
            </div>
        </div>
    )
}