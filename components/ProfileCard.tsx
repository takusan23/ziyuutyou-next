import Typography from "@mui/material/Typography"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import NextAvater from "./NextAvater"
import React, { useEffect, useState } from "react"
import CardActions from "@mui/material/CardActions"
import BookOutlined from "@mui/icons-material/BookOutlined"
import RoundedCornerBox from "./RoundedCorner"
import profileCardJpegImg from "../public/profile_card_img.jpg"
import NextLinkButton from "./NextLinkButton"

/** ProfileCard へ渡すデータ */
type ProfileCardProps = {
    /** ランダムメッセージ一覧 */
    randomMessageList: Array<string>
}

/** アイコンと名前とメッセージ の部分 */
const ProfileCard: React.FC<ProfileCardProps> = (props) => {
    /** 一言メッセージ */
    const [msg, setMsg] = useState("")

    // ランダムで決定!
    useEffect(() => {
        const randomInt = Math.floor(Math.random() * props.randomMessageList.length);
        setMsg(props.randomMessageList[randomInt])
    }, [])

    return (
        <>
            <RoundedCornerBox value={3}>
                <CardHeader
                    avatar={
                        <NextAvater path="/icon.png" />
                    }
                    title="たくさん"
                    subheader="@takusan_23"
                />
                {/* next/imageの最適化機能、Vercel以外では使えないのでimg */}
                <img
                    style={{
                        height: '200px',
                        maxHeight: '200px',
                        width: '100%',
                        objectFit: 'cover'
                    }}
                    src={profileCardJpegImg.src} />
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        {msg}
                    </Typography>
                </CardContent>
                <CardActions>
                    <NextLinkButton
                        href="/posts/page/1/"
                        startIcon={<BookOutlined />}
                        text="記事一覧へ"
                    />
                </CardActions>
            </RoundedCornerBox>
        </>
    )
}

export default ProfileCard