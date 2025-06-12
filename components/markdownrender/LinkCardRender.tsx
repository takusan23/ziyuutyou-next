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
    /** 子要素。子要素が存在する場合はリンクカードよりもこちらが優先されます。 */
    children?: ReactNode
}

/** LinkBox へ渡す Props */
type LinkBoxProps = {
    /** URL */
    urlObject: URL
    /** <a> につける ID */
    id?: string
    /** className 指定するなら */
    className?: string
    /** 子要素 */
    children: ReactNode
}

/** <a> か <Link> でラップする */
function LinkBox({ urlObject, id, className, children }: LinkBoxProps) {
    // 自分のサイトの遷移であれば next/link を使ってプリフェッチの恩恵を受ける
    if (`${urlObject.protocol}//${urlObject.host}` === EnvironmentTool.BASE_URL) {
        return (
            <Link href={urlObject.pathname} className={className} id={id}>
                {children}
            </Link>
        )
    } else {
        return (
            <a href={urlObject.href} className={className} id={id}>
                {children}
            </a>
        )
    }
}

/** リンクカードが利用できるなら表示する。なければ <a>。 TODO <a> の子要素よりもリンクカードが優先されている */
export default async function LinkCardRender({ href, id, children }: LinkCardRenderProps) {
    // children か href
    const childrenOrHref = children ?? <>{href}</>

    // 存在しないなら
    if (!href) return <>{childrenOrHref}</>
    const urlObject = new URL(href, EnvironmentTool.BASE_URL)

    // 子要素があれば優先
    if (children) {
        return (
            <LinkBox urlObject={urlObject} className="text-[revert] underline" id={id}>
                <>{children}</>
            </LinkBox>
        )
    }

    // サイトにアクセスして OGP 情報を取得
    // 最低限 title がないと作らない
    const { img, title, description, url } = await LinkCardTool.getLinkCardData(urlObject.href)
    if (!title) {
        return (
            <LinkBox urlObject={urlObject} className="text-[revert] underline" id={id}>
                <>{childrenOrHref}</>
            </LinkBox>
        )
    }

    // リンクカードを作る
    return (
        <LinkBox urlObject={urlObject} id={id}>
            <div className="flex flex-row items-center h-[128px] border rounded-md overflow-hidden border-content-primary-light dark:border-content-primary-dark">
                {
                    img && <img
                        className="object-cover h-full"
                        width={227}
                        height={128}
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