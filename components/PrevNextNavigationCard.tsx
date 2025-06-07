import Link from "next/link"
import IconParent from "./IconParent"
import TurnRightIcon from "../public/icon/turn_right.svg"
import TurnLeftIcon from "../public/icon/turn_left.svg"

type PrevNextNavigationCardProps = {
    turn: 'right' | 'left'
    url: string
    title: string
    subTitle: string
}

/** 道路案内標識みたいな UI。前後の記事表示で使っている */
export default function PrevNextNavigationCard({ turn, url, title, subTitle }: PrevNextNavigationCardProps) {
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