import { ReactNode } from "react"
import type { Element } from "hast"
import MarkdownParser from "../../src/MarkdownParser"

/** HeadingElement に渡す Props */
type HeadingElementProps = {
    /** h1 ~ h6 のどれか */
    tagName: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    /** id 属性作成のために h1 等のそれ自身を */
    element: Element
    /** 子。文字だと思う */
    children: ReactNode
}

/** h1 から h6 までを描画する。見出しはこっちで付与します。rehype-slug 実装相当です。 */
export default function HeadingElement({ tagName, element, children }: HeadingElementProps) {
    const { id } = MarkdownParser.createHeadingData(element)
    switch (tagName) {
        case "h1":
            return <h1 id={id} className="text-2xl text-content-primary-light dark:text-content-primary-dark mt-6 mb-4 font-medium border-b-[1px] border-content-primary-light dark:border-content-primary-dark">{children}</h1>
        case "h2":
            return <h2 id={id} className="text-xl text-content-primary-light dark:text-content-primary-dark mt-6 mb-4 font-medium border-b-[1px] border-content-primary-light dark:border-content-primary-dark">{children}</h2>
        case "h3":
            return <h3 id={id} className="text-lg text-content-primary-light dark:text-content-primary-dark mt-6 mb-4 font-medium border-b-[1px] border-content-primary-light dark:border-content-primary-dark">{children}</h3>
        case "h4":
            return <h4 id={id} className="text-content-primary-light dark:text-content-primary-dark mt-6 mb-4 font-medium border-b-[1px] border-content-primary-light dark:border-content-primary-dark">{children}</h4>
        case "h5":
            return <h5 id={id} className="text-content-primary-light dark:text-content-primary-dark mt-6 mb-4 font-medium border-b-[1px] border-content-primary-light dark:border-content-primary-dark">{children}</h5>
        case "h6":
            return <h6 id={id} className="text-content-primary-light dark:text-content-primary-dark mt-6 mb-4 font-medium border-b-[1px] border-content-primary-light dark:border-content-primary-dark">{children}</h6>
    }
}