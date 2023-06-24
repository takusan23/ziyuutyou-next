/** RoundedImage へ渡すデータ */
type RoundedImageProps = {
    /** 画像のパス */
    src: string
}

/** まんまる img  */
export default function RoundedImage({ src }: RoundedImageProps) {
    return (
        <img
            className="w-10 h-10 rounded-full mr-2"
            src={src}
        />
    )
}