import Link from "next/link"
import EnvironmentTool from "../../src/EnvironmentTool"
import LinkCardTool from "../../src/LinkCardTool"

/** LinkCardRender へ渡す Props */
type LinkCardRenderProps = {
    /** URL */
    href?: string
    /** <a> につける ID */
    id?: string
}

/** リンクカードが利用できるなら表示する。なければ <a> */
export default async function LinkCardRender({ href }: LinkCardRenderProps) {
    // 存在しないなら empty
    if (!href) return <></>

    // サイトにアクセスして OGP 情報を取得
    const urlObject = new URL(href, EnvironmentTool.BASE_URL)
    const { img, title, description, url } = await LinkCardTool.getLinkCardData(urlObject.href)

    // リンクカードを作る
    // 最低限 title がないと <a> にフォールバックするように
    const linkCardElement = title ? (
        <div className="flex flex-row items-center border rounded-md overflow-hidden border-content-primary-light dark:border-content-primary-dark">
            {
                img && <img
                    className="object-cover"
                    width={200}
                    height={150}
                    src={img}
                    loading="lazy" />
            }
            <div className="flex-1 flex flex-col p-2 space-y-1">
                <p className="wrap-anywhere text-md line-clamp-2 text-content-text-light dark:text-content-text-dark underline">{title}</p>
                <p className="wrap-anywhere text-sm line-clamp-2 text-content-text-light dark:text-content-text-dark">{description}</p>
                <p className="wrap-anywhere text-xs line-clamp-2 text-content-text-light dark:text-content-text-dark">{url}</p>
            </div>
        </div>
    ) : (
        <span className="text-[revert] underline">
            {href}
        </span>
    )

    // 自分のサイトの遷移であれば next/link を使ってプリフェッチの恩恵を受ける
    if (`${urlObject.protocol}//${urlObject.host}` === EnvironmentTool.BASE_URL) {
        return (
            <Link href={urlObject.pathname}>
                {linkCardElement}
            </Link>
        )
    } else {
        return (
            <a href={urlObject.href}>
                {linkCardElement}
            </a>
        )
    }
}