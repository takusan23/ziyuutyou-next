"use client"

import React, { useEffect, useState } from "react"
import profileCardJpegImg from "../public/profile_card_img.jpg"
import RoundedCornerBox from "./RoundedCornerBox"
import NextLinkButton from "./NextLinkButton"
import RoundedImage from "./RoundedImage"
import BookIcon from "../public/icon/book.svg"

/** ProfileCard へ渡すデータ */
type ProfileCardProps = {
    /** ランダムメッセージ一覧 */
    randomMessageList: Array<string>
}

/** アイコンと名前とメッセージ の部分 */
export default function ProfileCard({ randomMessageList }: ProfileCardProps) {
    /** 一言メッセージ */
    const [message, setMessage] = useState("")

    // ランダムで決定!
    useEffect(() => {
        const randomInt = Math.floor(Math.random() * randomMessageList.length);
        setMessage(randomMessageList[randomInt])
    }, [])

    return (
        <RoundedCornerBox rounded="large">

            <div className="flex flex-row items-center p-3">
                <RoundedImage src="/icon.png" />
                <div className="flex-col">
                    <p className="text-content-text-light dark:text-content-text-dark text-base">たくさん</p>
                    <p className="text-content-text-light dark:text-content-text-dark text-sm">@takusan_23</p>
                </div>
            </div>

            {/* next/imageの最適化機能、Vercel以外では使えないのでimg */}
            <img className="h-[200px] w-full object-cover" src={profileCardJpegImg.src} />

            <div className="text-content-text-light dark:text-content-text-dark p-3">
                {message}
            </div>

            <div className="flex flex-row-reverse p-3">
                <NextLinkButton
                    href="/posts/page/1/"
                    text="記事一覧へ"
                    startIcon={<BookIcon />}
                />
            </div>
        </RoundedCornerBox>
    )
}