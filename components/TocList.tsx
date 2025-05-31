import { ReactNode } from "react"
import Link from "next/link"
import RoundedCornerBox from "./RoundedCornerBox"
import IconParent from "./IconParent"
import ExpandMore from "../public/icon/expand_more.svg"
import Spacer from "./Spacer"
import MarkdownParser from "../src/MarkdownParser"

// 定数
const TOC_LIST_WIDTH = 'w-[300px]'
const MASTER_WIDTH = 'w-full lg:w-[calc(100%-300px)]'

/** TocList へ渡すデータ */
type TocListProps = {
    /** markdown 本文 */
    markdown: string
}

/** TocListLayout へ渡すデータ */
type TocListLayoutProps = {
    /** セカンダリー コンポーネント。これが目次になる */
    secondary: ReactNode
    /** マスター コンポーネント */
    children: ReactNode
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
                {secondary}
            </div>
        </div>
    )
}

/**
 * スマホ用の目次。
 * 記事の前に表示される。
 */
export function ExpandTocList({ markdown }: TocListProps) {
    return (
        <RoundedCornerBox
            className="lg:hidden select-none bg-container-secondary-light dark:bg-container-secondary-dark"
            rounded="large"
        >
            <details className="group" open={false}>

                {/* 展開してない時に出る部分 */}
                <summary className="p-4 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex flex-row items-center group-open:border-b-[1px] border-content-primary-light dark:border-content-primary-dark">
                        <p className="text-lg text-content-primary-light dark:text-content-primary-dark grow">
                            目次
                        </p>
                        <IconParent className="group-open:rotate-180 fill-content-primary-light dark:fill-content-primary-dark">
                            <ExpandMore />
                        </IconParent>
                    </div>
                </summary>

                <TocList markdown={markdown} />

                <Spacer space="medium" />
            </details>
        </RoundedCornerBox>
    )
}


/**
 * 画面が広いとき用の目次。
 * 記事の隣に表示される。
 */
export function LargeTocList({ markdown }: TocListProps) {
    return (
        <RoundedCornerBox
            rounded="large"
            className="ml-2 bg-container-secondary-light dark:bg-container-secondary-dark"
        >
            <div className="overflow-auto h-screen py-4">
                <TocList markdown={markdown} />
            </div>
        </RoundedCornerBox>
    )
}

async function TocList({ markdown }: TocListProps) {
    const mdast = await MarkdownParser.parseMarkdownToHtmlAst(markdown)
    const headingList = MarkdownParser.findAllHeading(mdast)

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
        <ul className="space-y-2">
            {
                headingList.map((element, index) => {
                    const { id, name } = MarkdownParser.createHeadingData(element)
                    return (
                        // h 抜きの番号を渡す
                        <li
                            key={index}
                            className={calcPaddingLeft(Number(element.tagName.replace('h', '')))}
                        >
                            <Link
                                className="no-underline text-content-primary-light dark:text-content-primary-dark"
                                href={`#${id}`}
                            >
                                <p className="text-content-primary-light dark:text-content-primary-dark ">
                                    {name}
                                </p>
                            </Link>
                        </li>
                    )
                })
            }
        </ul>
    )
}
