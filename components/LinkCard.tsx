import Link from "next/link"
import React from "react"
import LinkData from "../src/data/LinkData"
import RoundedCornerBox from "./RoundedCorner"
import Spacer from "./Spacer"
import HomeIcon from "../public/icon/material-home.svg"

/** LinkCard へ渡すデータ */
type LinkCardProps = {
    /** リンクのデータの配列 */
    linkList: LinkData[]
}

/** リンク集を表示する部分 */
export default function LinkCard({ linkList }: LinkCardProps) {
    return (
        <RoundedCornerBox value={10}>
            <div className="p-3">
                <h2 className="text-2xl text-content-primary-light">
                    リンク
                </h2>
                <p>
                    Twitterが良いと思います
                </p>
                {
                    linkList.map((linkData) => (
                        <RoundedCornerBox
                            className='bg-background-light'
                            key={linkData.name}
                            value={10}
                        >
                            <Spacer value={10} />
                            <Link
                                className="no-underline text-inherit"
                                href={linkData.href}
                            >
                                <div className="flex flex-row p-3 items-center">
                                    <div className="flex flex-col grow">
                                        <p className="text-base">{linkData.name}</p>
                                        <p className="text-sm">{linkData.description}</p>
                                    </div>
                                    <HomeIcon className="w-5 h-5" />
                                </div>
                            </Link>
                        </RoundedCornerBox>
                    ))
                }
            </div>
        </RoundedCornerBox>
    )
}