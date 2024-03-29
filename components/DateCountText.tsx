"use client"
import { useEffect, useState } from "react"
import DateDiffTool from "../src/DateDiffTool"
import IconParent from "./IconParent"
import UploadFileIcon from "../public/icon/upload_file.svg"

/** DateCountText へ渡すデータ */
type DateCountTextProps = {
    /** time タグに入れるためのフォーマット。yyyy-MM-dd */
    timeTagTimeFormat: string
    /** 作成日時。yyyy/MM/dd */
    dateTimeFormat: string
    /** 作成日時。UnixTime */
    createdAtUnixTime: number
}

/** 何日前かを表示するコンポーネント。クライアント側で計算するため use client します。 */
export default function DateCountText({ timeTagTimeFormat, dateTimeFormat, createdAtUnixTime }: DateCountTextProps) {
    // 何日前かを計算する
    const [diffDate, setDiffDate] = useState(0)
    useEffect(() => {
        // クライアント側で計算する
        setDiffDate(DateDiffTool.nowDateDiff(createdAtUnixTime))
    }, [])

    return (
        <div className="flex flex-row flex-wrap items-center">
            <IconParent className="fill-content-primary-light dark:fill-content-primary-dark">
                <UploadFileIcon />
            </IconParent>
            <p className="text-content-primary-light dark:text-content-primary-dark">
                <span>投稿日 : </span>
                {/* time にしないと、Googleとかの検索結果に日付が出ない？ */}
                <time dateTime={timeTagTimeFormat}>{dateTimeFormat}</time>
                <span>{` | ${diffDate} 日前`}</span>
            </p>
        </div>
    )
}