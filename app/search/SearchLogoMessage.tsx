import SearchImage from "../../public/search.svg"
// SVG に色を当てるための CSS。
import "../../styles/css/svg-css.css"

/** SearchLogoMessage に渡す Props */
type SearchLogoMessageProps = {
    /** メッセージ */
    message: string
}

/** ロゴとメッセージ */
function SearchLogoMessage({ message }: SearchLogoMessageProps) {
    return (
        <div className="flex flex-col items-center w-full space-y-6">
            <SearchImage
                className="theme_color"
                aria-label="虫眼鏡で太陽光を集めている絵"
                width={200}
                height={100} />
            <p className="text-content-primary-light dark:text-content-primary-dark">
                {message}
            </p>
        </div>
    )
}

export default SearchLogoMessage