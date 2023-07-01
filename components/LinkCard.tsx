import Link from "next/link"
import LinkData from "../src/data/LinkData"
import RoundedCornerBox from "./RoundedCorner"
import HomeIcon from "../public/icon/material-home.svg"
import RoundedCornerList from "./RoundedCornerList"

/** LinkCard へ渡すデータ */
type LinkCardProps = {
    /** リンクのデータの配列 */
    linkList: LinkData[]
}

/** リンク集を表示する部分 */
export default function LinkCard({ linkList }: LinkCardProps) {
    return (
        <RoundedCornerBox rounded="large">
            <div className="flex flex-col p-3 space-y-2">

                <h2 className="text-content-primary-light dark:text-content-primary-dark text-2xl">
                    リンク
                </h2>
                <p className="text-content-text-light dark:text-content-text-dark ">
                    Twitterが良いと思います
                </p>

                <RoundedCornerList
                    list={linkList}
                    content={(className, linkData) => (
                        <div
                            className={`${className} bg-background-light dark:bg-background-dark`}
                            key={linkData.href}
                        >
                            <Link
                                className="no-underline text-inherit"
                                href={linkData.href}
                            >
                                <div className="flex flex-row p-3 items-center">
                                    <div className="flex flex-col grow">
                                        <p className="text-content-text-light dark:text-content-text-dark text-base">{linkData.name}</p>
                                        <p className="text-content-text-light dark:text-content-text-dark text-sm">{linkData.description}</p>
                                    </div>
                                    <HomeIcon className="w-5 h-5" />
                                </div>
                            </Link>
                        </div>
                    )}
                />
            </div>
        </RoundedCornerBox>
    )
}