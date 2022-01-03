import Typography from "@mui/material/Typography"
import CardHeader from "@mui/material/CardHeader"
import CardMedia from "@mui/material/CardMedia"
import CardContent from "@mui/material/CardContent"
import NextAvater from "./NextAvater"
import { useEffect, useState } from "react"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import { BookOutlined } from "@mui/icons-material"
import Link from "next/link"
import RoundedCornerBox from "./RoundedCorner"

/** 一言メッセージ */
const textList = [
    "このサイトはNext.jsとMaterial-UIでできています。普段はAndroidアプリを書いてます。たまにJavaScriptとかWPFとか。",
    "JetpackComposeとReactって似てるから書きやすい。",
    "4G転用5Gって何がやりたいんや？",
    "D.C.4 SH 発表めでたい!",
    "コンビニのセイイキはまだですかね、fengさん？"
]

/** アイコンと名前とひとこと の部分 */
const ProfileCard = () => {
    /** 一言メッセージ */
    const [msg, setMsg] = useState("")

    // ランダムで決定!
    useEffect(() => {
        const randomInt = Math.floor(Math.random() * textList.length);
        setMsg(textList[randomInt])
    }, [])

    return (
        <RoundedCornerBox value={3}>
            <CardHeader
                avatar={
                    <NextAvater path="/icon.png" />
                }
                title="たくさん"
                subheader="@takusan_23"
            />
            <CardMedia
                component="img"
                height="194"
                alt="なんか思いついたら画像を貼る"
            />
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    {msg}
                </Typography>
            </CardContent>
            <CardActions>
                <Link passHref href="/posts/page/1">
                    <Button
                        sx={{ borderRadius: 10, marginLeft: 'auto' }}
                        variant="contained"
                        disableElevation
                        aria-expanded={true}
                        startIcon={<BookOutlined />}>
                        記事一覧へ
                    </Button>
                </Link>
            </CardActions>
        </RoundedCornerBox>
    )
}

export default ProfileCard