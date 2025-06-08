import Link from "next/link"
import EnvironmentTool from "../../src/EnvironmentTool"
import LinkCardTool from "../../src/LinkCardTool"
import { ReactNode } from "react"

/** LinkCardRender へ渡す Props */
type LinkCardRenderProps = {
    /** URL */
    href?: string
    /** <a> につける ID */
    id?: string
}

/** LinkBox へ渡す Props */
type LinkBoxProps = {
    /** URL */
    urlObject: URL
    /** className 指定するなら */
    className?: string
    /** 子要素 */
    children: ReactNode
}

/** <a> か <Link> でラップする */
function LinkBox({ urlObject, className, children }: LinkBoxProps) {
    // 自分のサイトの遷移であれば next/link を使ってプリフェッチの恩恵を受ける
    if (`${urlObject.protocol}//${urlObject.host}` === EnvironmentTool.BASE_URL) {
        return (
            <Link href={urlObject.pathname} className={className}>
                {children}
            </Link>
        )
    } else {
        return (
            <a href={urlObject.href} className={className}>
                {children}
            </a>
        )
    }
}

/** リンクカードが利用できるなら表示する。なければ <a> */
export default async function LinkCardRender({ href }: LinkCardRenderProps) {
    // 存在しないなら empty
    if (!href) return <></>

    // サイトにアクセスして OGP 情報を取得
    const urlObject = new URL(href, EnvironmentTool.BASE_URL)
    const { img, title, description, url } = await LinkCardTool.getLinkCardData(urlObject.href)

    // 最低限 title がないと作らないように
    // ない場合は普通のリンク
    if (!title) {
        return (
            <LinkBox urlObject={urlObject} className="text-[revert] underline">
                <>{href}</>
            </LinkBox>
        )
    }

    // リンクカードを作る
    return (
        <LinkBox urlObject={urlObject}>
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
        </LinkBox>
    )
}