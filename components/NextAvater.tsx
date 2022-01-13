import Avatar from "@mui/material/Avatar"

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
    // next/imageの最適化機能、Vercel以外では使えないのでimg
    return (
        <>
            <Avatar
                alt={props.alt}
                src={props.path}
                sx={{
                    width: props.width,
                    height: props.height,
                }} />

        </>
    )
}

export default NextAvater