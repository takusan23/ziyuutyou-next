import Icon from "../../components/Icon"

/** SearchLogoMessage に渡す Props */
type SearchLogoMessageProps = {
    /** メッセージ */
    message: string
}

/** ロゴとメッセージ */
function SearchLogoMessage({ message }: SearchLogoMessageProps) {
    return (
        <div className="flex flex-col items-center w-full space-y-6">
            <Icon
                iconStyle="mask-[url('/search.svg')]"
                color="theme"
                className="w-52 h-28"
                aria-label="虫眼鏡で太陽光を集めている絵" />
            <p className="text-content-primary-light dark:text-content-primary-dark">
                {message}
            </p>
        </div>
    )
}

export default SearchLogoMessage