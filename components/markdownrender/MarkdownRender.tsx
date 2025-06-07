import Link from "next/link"
import type { RootContent, Element } from "hast"
import { whitespace } from "hast-util-whitespace"
import MarkdownParser from "../../src/MarkdownParser"
import { FallbackElement } from "./DefaultRenderer"
import EnvironmentTool from "../../src/EnvironmentTool"
import ShikiCodeBlockRender from "./ShikiCodeBlockRender"
import HeadingElement from "./HeadingRender"
import ClientScriptRender from "./ClientScriptRender"

/**
 * 自前で描画するタグ <HtmlElementRender />
 * 自前で描画する場合、タグの中で使うタグも自前で描画する必要があります（table なら thead とか）
 */
const ReBuildHtmlElementTagNames = [
    // グループ
    "div",
    // 改行
    "br",
    // 文字
    // 文章、文字、太字、右上につける文字、斜め、打ち消し線
    "p", "span", "strong", "sup", "em", "del",
    // リンク
    "a",
    // セクション
    "section",
    // 引用
    "blockquote",
    // 折りたたみ要素
    "details", "summary",
    // 区切り線
    "hr",
    // 画像
    "img",
    // 箇条書き
    "ol", "ul", "li",
    // 表
    "table", "thead", "tbody", "tr", "td", "th",
    // 見出し
    "h1", "h2", "h3", "h4", "h5", "h6",
    // コード・コードブロック
    "pre", "code",
    // スクリプト
    "script", "noscript",
    // iframe
    "iframe"
] as const

/** ReBuildHtmlElementTagNames を union にしたもの */
type ReBuildHtmlElementTypes = typeof ReBuildHtmlElementTagNames[number]

/** MarkdownView に渡す Props */
type MarkdownViewProps = {
    /** Markdown 本文 */
    markdown: string
}

/** MarkdownNodeRender に渡す Props */
type HtmlElementRenderProps = {
    /** 各要素 */
    element: RootContent
}

/** HTML AST の element を受け取って、自前で描画する */
function HtmlElementRender({ element }: HtmlElementRenderProps) {

    // "element" 以外はここでふるい落とす
    // text は <p> の中身などで使っている
    // raw は Markdown に html 直接書いたとき
    switch (element.type) {
        case "comment": return <></>
        case "doctype": return <></>

        // HTML なので、AST に変換して、配列の各要素を再帰的に呼び出す
        // raw が親のとき
        case "raw":
            return MarkdownParser.parseHtmlAstFromHtmlString(element.value).map((child, index) => <HtmlElementRender key={index} element={child} />)

        // HTML 的に空白とかはむしろエラーになるので、空の文字列は return
        // 例: In HTML, whitespace text nodes cannot be a child of <table>.
        case "text":
            return whitespace(element.value) ? <></> : <>{element.value}</>

        // 続行
        case "element": break
    }

    // unifid に投げるか
    // 自前で描画したはずなのに、unified にフォールバックしている場合
    // 不具合を見つけやすくするため、console.log しておく
    let isFallback = false

    // そもそも親が描画できない
    if (ReBuildHtmlElementTagNames.includes(element.tagName as any) === false) {
        console.log(`親のタグが描画できないため unified へフォールバックします。${element.tagName}`)
        isFallback = true
    }

    // 子の中に自分で描画できない要素がある
    if (element.children.filter((node) => node.type === "element").some((element) => ReBuildHtmlElementTagNames.includes(element.tagName as any) === false)) {
        const childTagNameList = element.children.filter((node) => node.type === "element").map((element) => element.tagName)
        console.log(`子に描画できないタグがあるため unified へフォールバックします。${childTagNameList}`)
        isFallback = true
    }

    // 子に raw（Markdown に HTML）を持つ
    // <p> の中で <div> を使うことが出来ないため
    if (element.children.some((node) => node.type === "raw")) {
        console.log(`直接書いた HTML を子に持つため unified へフォールバックします`)
        isFallback = true
    }

    // Markdown に書いた HTML で style を当てていた場合もフォールバック
    // JSX では style を object で渡す必要があり、
    // HTML に書いた style は文字列だと渡せない
    if ("style" in element.properties || element.children.some((element) => element.type === "element" && "style" in element.properties)) {
        console.log(`親か子が Markdown に書いた HTML に style を指定しているため、unified へフォールバックします`)
        isFallback = true
    }

    // フォールバックする場合
    if (isFallback) {
        // 自前で描画無理なので unified で HTML を作る
        return <FallbackElement content={element} />
    }

    // 自分で描画する場合、子を children: ReactNode に入れる必要があるので、再帰で作っておく
    const childrenHtml = element.children.map((node, index) => <HtmlElementRender key={index} element={node} />)

    // 自前で作っている部分
    const tagName = element.tagName as ReBuildHtmlElementTypes
    switch (tagName) {

        case "div":
            return <div>{childrenHtml}</div>
        case "br":
            return <br />

        // 文字系
        case "p":
            return <p className="my-4 text-content-text-light dark:text-content-text-dark">{childrenHtml}</p>
        case "span":
            return <span>{childrenHtml}</span>
        case "em":
            return <em>{childrenHtml}</em>
        case "del":
            return <del>{childrenHtml}</del>
        case "strong":
            return <strong>{childrenHtml}</strong>
        case "sup":
            return <sup>{childrenHtml}</sup>
        case "blockquote":
            return <blockquote>{childrenHtml}</blockquote>

        // img
        // 画像読み込みを遅延させたい
        // 押したら別タブで画像を開きたい
        case "img":
            const imgSrc = element.properties['src']?.toString()
            return <a href={imgSrc} target="_blank" className="inline-block max-w-[80%]">
                <img loading="lazy" src={element.properties['src']?.toString()} alt={element.properties['alt']?.toString()} />
            </a>

        // a
        // サイト内の遷移の場合は next/link にする
        // リセット CSS で色が消えてしまったので戻す TODO スタイリングしても良いかも
        case "a":
            const href = element.properties['href']?.toString()
            const anchorId = element.properties['id']?.toString()
            if (href?.startsWith(EnvironmentTool.BASE_URL) || href?.startsWith('http') === false) {
                return <Link id={anchorId} className="text-[revert] underline" href={href}>{childrenHtml}</Link>
            } else {
                return <a id={anchorId} className="text-[revert] underline" href={href}>{childrenHtml}</a>
            }


        // 箇条書き
        case "ul":
            return <ul className="list-disc m-[revert] p-[revert]">{childrenHtml}</ul>
        case "li":
            const liId = element.properties['id']?.toString()
            return <li id={liId}>{childrenHtml}</li>
        case "ol":
            return <ol>{childrenHtml}</ol>

        // テーブル
        case "table":
            return <table className="m-2 w-full p-3 border-collapse border-b-spacing-0 border-b-[1px] border-b-content-primary-light dark:border-content-primary-dark">{childrenHtml}</table>
        case "tr":
            return <tr className="border-b-2 border-b-content-primary-light dark:border-b-content-primary-dark">{childrenHtml}</tr>
        case "td":
            return <td className="p-2 text-center">{childrenHtml}</td>
        case "th":
            return <th className="text-center">{childrenHtml}</th>
        case "thead":
            return <thead>{childrenHtml}</thead>
        case "tbody":
            return <tbody>{childrenHtml}</tbody>

        // h1 h2 ...
        // Tailwind CSS で色付けをする
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            return <HeadingElement tagName={tagName} element={element}>{childrenHtml}</HeadingElement>

        // コードブロック
        // pre の中の code を見る
        // language-... の prefix を消してから shiki へ
        case "pre":
            const codeElement = element.children[0] as Element
            const textNode = codeElement.children[0]
            const code = textNode.type === "text" ? textNode.value : ""
            const lang = codeElement.properties?.['className']?.[0]?.replace('language-', '') ?? ""
            return <ShikiCodeBlockRender code={code} language={lang} />

        // 単発コード
        // 複数行は pre で全部やるので、ここに来ない
        case "code":
            return <code className="px-2 font-(family-name:--koruri-font) rounded-md bg-gray-200">{childrenHtml}</code>

        // script
        // noscript もついでに
        case "script":
            const src = element.properties['src']?.toString()
            const type = element.properties['type']?.toString()
            return <ClientScriptRender src={src} type={type}>{childrenHtml}</ClientScriptRender>
        case "noscript":
            return <noscript>{childrenHtml}</noscript>

        // iframe
        // どのキーがあるか分からないので、スプレッドで
        case "iframe":
            return <iframe {...element.properties}>{childrenHtml}</iframe>

        // セクション
        case "section":
            return <section>{childrenHtml}</section>

        // 折りたたみ
        case "details":
            return <details>{childrenHtml}</details>
        case "summary":
            return <summary>{childrenHtml}</summary>

        // 区切り線
        case "hr":
            return <hr />
    }
}

/**
 * Markdown を unified にかけて、部分的に時前で描画する
 * @see MarkdownParser
 */
export default async function MarkdownRender({ markdown }: MarkdownViewProps) {
    // Markdown から HTML AST を取得する
    const htmlAst = await MarkdownParser.parseMarkdownToHtmlAst(markdown)

    // 各要素を受け取って組み立てる
    // 一部の element (HTML タグ) は自前で描画する（リンクカード作りたい）
    const nodeJsxList = htmlAst.children.map((node, index) => <HtmlElementRender key={index} element={node} />)

    return (
        // 文字がはみ出ないように
        <div className="content_div wrap-break-word">
            {nodeJsxList}
        </div>
    )
}