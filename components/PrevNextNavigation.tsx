import Link from "next/link"
import IconParent from "./IconParent"
import TurnRightIcon from "../public/icon/turn_right.svg"
import TurnLeftIcon from "../public/icon/turn_left.svg"
import ContentFolderManager from "../src/ContentFolderManager"

/** PrevNextNavigationCard へ渡す Props */
type PrevNextNavigationCardProps = {
    /** 矢印の向き */
    turn: 'right' | 'left'
    /** URL */
    url: string
    /** タイトル */
    title: string
    /** サブタイトル */
    subTitle: string
}

/** PrevNextNavigation へ渡す Props */
type PrevNextNavigationProps = {
    /** 本記事の URL */
    url: string
}

/** 道路案内標識みたいな UI。前後の記事表示 */
function PrevNextNavigationCard({ turn, url, title, subTitle }: PrevNextNavigationCardProps) {
    return (
        <Link href={url} className="flex flex-row items-center p-2 rounded-2xl bg-content-primary-light">
            <IconParent className="mx-1 w-10 h-10 fill-content-text-dark">
                {
                    turn === 'right'
                        ? <TurnRightIcon />
                        : <TurnLeftIcon />
                }
            </IconParent>
            <div className="flex-1 flex flex-col space-y-1">
                <p className="text-content-text-dark">
                    {turn === 'right' ? '前の記事' : '次の記事'}
                </p>
                <p className="text-content-text-dark text-xl">
                    {title}
                </p>
                <p className="text-content-text-dark">
                    {subTitle}
                </p>
            </div>
        </Link>
    )
}

/** 前後の記事を表示する */
export default async function PrevNextNavigation({ url }: PrevNextNavigationProps) {
    const { next, prev } = await ContentFolderManager.getPrevNextBlogItem(url)
    // todo 直進: 先頭に移動 を追加したい
    return (
        <div className="flex-1 flex flex-col space-y-2">
            <p className="py-3 text-content-primary-light dark:text-content-primary-dark text-2xl">
                ごあんない
            </p>
            {
                next && <PrevNextNavigationCard
                    url={next.link}
                    title={next.title}
                    subTitle={next.createdAt}
                    turn="left" />
            }
            {
                prev && <PrevNextNavigationCard
                    url={prev.link}
                    title={prev.title}
                    subTitle={prev.createdAt}
                    turn="right" />
            }
        </div>
    )
}