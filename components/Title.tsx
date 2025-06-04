/** Title へ渡す Props */
type TitleProps = {
    title: string
    subTitle?: string
}

/** 記事のタイトルや、一覧ページのタイトル */
export default function Title({ title, subTitle }: TitleProps) {
    return (
        <div className="flex flex-col py-3">
            <h1 className="text-content-primary-light dark:text-content-primary-dark text-3xl">
                {title}
            </h1>
            <h3 className="text-content-primary-light dark:text-content-primary-dark text-lg">
                {subTitle}
            </h3>
        </div>
    )
}