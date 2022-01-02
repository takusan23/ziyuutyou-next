import Avatar from "@mui/material/Avatar"
import Image from 'next/image'

/** NextAvater へ渡すデータ */
type NextAvaterProps = {
    /** 画像パス */
    path: string,
    /** 幅 */
    width?: number,
    /** 高さ */
    height?: number,
    /** 画像の代替テキスト */
    alt?: string,
}

/** Material-UIのAvaterにNext.jsのImageを搭載したもの */
const NextAvater: React.FC<NextAvaterProps> = (props) => {
    return (
        <Avatar alt={props.alt} sx={{
            width: props.width,
            height: props.height
        }}>
            {/* Next.jsのImageを利用することでページ遷移時でもパスを自動で修正してくれる */}
            <Image src={props.path} layout="fill" />
        </ Avatar>
    )
}

export default NextAvater