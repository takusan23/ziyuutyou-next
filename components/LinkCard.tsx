import Link from "next/link"
import LinkData from "../src/data/LinkData"
import RoundedCornerBox from "./RoundedCornerBox"
import RoundedCornerList from "./RoundedCornerList"
import IconParent from "./IconParent"
import OpenInBrowserIcon from "../public/icon/open_in_browser.svg"

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
                    Misskey お一人様サーバーにいます。お住まいの Misskey / Mastodon サーバーから探せるはずです。
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
                                rel={linkData.rel}
                            >
                                <div className="flex flex-row p-3 items-center">
                                    <div className="flex flex-col grow">
                                        <p className="text-content-text-light dark:text-content-text-dark text-base">{linkData.name}</p>
                                        <p className="text-content-text-light dark:text-content-text-dark text-sm">{linkData.description}</p>
                                    </div>
                                    <IconParent>
                                        <OpenInBrowserIcon />
                                    </IconParent>
                                </div>
                            </Link>
                        </div>
                    )}
                />
            </div>
        </RoundedCornerBox>
    )
}