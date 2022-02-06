import Head from "next/head"
import React from "react"

/** AndroidStatusbarColor にわたすデータ */
type AndroidStatusbarColorProps = {
    /** カラーコード */
    colorCode: string
}

/**
 * Androidのステータスバーに色を設定する 
 *
 * @param color 設定するカラーコード 
 */
const AndroidStatusbarColor: React.FC<AndroidStatusbarColorProps> = (props) => {
    return (
        <Head>
            <meta name="theme-color" content={props.colorCode} />
        </Head>
    )
}

export default AndroidStatusbarColor