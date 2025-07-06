import type { RootContent, Element } from "hast"
import { whitespace } from "hast-util-whitespace"
import MarkdownParser from "../../src/MarkdownParser"
import { FallbackElement } from "./FallbackElement"
import ShikiCodeBlockRender from "./ShikiCodeBlockRender"
import HeadingElement from "./HeadingRender"
import ClientScriptRender from "./ClientScriptRender"
import LinkCardRender from "./LinkCardRender"

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
async function HtmlElementRender({ element }: HtmlElementRenderProps) {

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

    // そもそも親（自分）が描画できない
    if (ReBuildHtmlElementTagNames.includes(element.tagName as any) === false) {
        if (process.env.NODE_ENV === "development") {
            console.log(`親のタグが描画できないため unified へフォールバックします。${element.tagName}`)
        }
        isFallback = true
    }

    // Markdown に書いた HTML で style を当てていた場合もフォールバック
    // JSX では style を object で渡す必要があり、
    // HTML に書いた style は文字列だと渡せない
    if ("style" in element.properties || element.children.some((element) => element.type === "element" && "style" in element.properties)) {
        if (process.env.NODE_ENV === "development") {
            console.log(`親か子が Markdown に書いた HTML に style を指定しているため、unified へフォールバックします`)
        }
        isFallback = true
    }

    // フォールバックする場合
    if (isFallback) {
        // 自前で描画無理なので unified で HTML を作る
        return <FallbackElement content={element} />
    }

    // TODO HTML を書いた場合はそのまま描画するべき、要素の属性がが消えてしまう
    // 自分で描画する場合、子を children: ReactNode に入れる必要があるので、再帰で作っておく
    // 一度 HTML にして HAST にしているのは、
    // ['<span style="color:red">', 'TEXT', '</span>']
    // のように HTML が element ではなく文字列になっていて、かつ、JSX で書くには扱いづらい。
    // なので手間だが一旦変換している。
    const childrenHtml = await MarkdownParser.buildHtmlFromHtmlAstList(element.children)
    const childrenNodeList = MarkdownParser.parseHtmlAstFromHtmlString(childrenHtml)
    const childrenJsx = childrenNodeList.map((node, index) => <HtmlElementRender key={index} element={node} />)

    // 自前で作っている部分
    const tagName = element.tagName as ReBuildHtmlElementTypes
    switch (tagName) {

        case "div":
            return <div>{childrenJsx}</div>
        case "br":
            return <br />

        // unified rehype が各要素を <p> でラップしようとする
        // https://github.com/rehypejs/rehype/issues/160
        // が、p の子に div はだめ → <p> <div/> <p>
        // <p> に div を入れている処理が
        // ここの switch と、
        // <a> タグのリンクカード
        // <pre> のコードブロック
        // childrenNodeList（親が描画できない場合）
        case "p":
            // <p> の中に入れてよいか判定
            // <div> が 0 じゃないと <p> に入れない
            const hasDiv = 0 != MarkdownParser.findNestedElement({ type: 'root', children: childrenNodeList }, ["a", "pre", "div"]).length
            // フォールバックする予定の場合（div に入れる。）（childernJsx は JSX なのでそれ以上の情報がない）
            // TODO 子の子までは見ていない
            const isChildrenFallback = childrenNodeList
                .filter((node) => node.type === "element")
                .some((element) => !ReBuildHtmlElementTagNames.includes(element.tagName as any))
            // style もみている
            const isSetStyleAttribute = childrenNodeList
                .filter((node) => node.type === "element")
                .some((element) => "style" in element.properties)
            // ok なら <p>
            const isAvailablePTagContains = !hasDiv && !isChildrenFallback && !isSetStyleAttribute
            if (!isAvailablePTagContains && process.env.NODE_ENV === "development") {
                console.log('<p> タグに <div> を入れることが出来ないため、<div> に差し替えました。')
            }
            return isAvailablePTagContains
                ? <p className="my-4 text-content-text-light dark:text-content-text-dark">{childrenJsx}</p>
                : <div className="my-4 text-content-text-light dark:text-content-text-dark">{childrenJsx}</div>

        // 文字
        case "span":
            return <span>{childrenJsx}</span>
        case "em":
            return <em>{childrenJsx}</em>
        case "del":
            return <del>{childrenJsx}</del>
        case "strong":
            return <strong>{childrenJsx}</strong>
        case "sup":
            return <sup>{childrenJsx}</sup>
        case "blockquote":
            return <blockquote>{childrenJsx}</blockquote>

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
        // URL が直書きの場合はリンクカード、リンクの説明があれば説明を優先する
        // リセット CSS で色が消えてしまったので戻す TODO スタイリングしても良いかも
        case "a":
            const href = element.properties['href']?.toString()
            const anchorId = element.properties['id']?.toString()
            // TODO テキストノードがあって、URL だった場合は undefined。リンクカードにする。もうちょっと考えたほうが良いかな、、
            return <LinkCardRender href={href} id={anchorId}>
                {
                    element.children.every((element) => element.type === "text" && element.value === href)
                        ? undefined
                        : <>{childrenJsx}</>
                }
            </LinkCardRender>

        // 箇条書き
        case "ul":
            return <ul className="list-disc m-[revert] p-[revert]">{childrenJsx}</ul>
        case "li":
            const liId = element.properties['id']?.toString()
            return <li id={liId} className="text-content-text-light dark:text-content-text-dark">{childrenJsx}</li>
        case "ol":
            return <ol>{childrenJsx}</ol>

        // テーブル
        case "table":
            return <table className="m-2 w-full p-3 border-collapse border-b-spacing-0 border-b-[1px] border-b-content-primary-light dark:border-content-primary-dark">{childrenJsx}</table>
        case "tr":
            return <tr className="border-b-2 border-b-content-primary-light dark:border-b-content-primary-dark">{childrenJsx}</tr>
        case "td":
            return <td className="p-2 text-center">{childrenJsx}</td>
        case "th":
            return <th className="text-center">{childrenJsx}</th>
        case "thead":
            return <thead>{childrenJsx}</thead>
        case "tbody":
            return <tbody>{childrenJsx}</tbody>

        // h1 h2 ...
        // Tailwind CSS で色付けをする
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            return <HeadingElement tagName={tagName} element={element}>{childrenJsx}</HeadingElement>

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
            return <code className="px-2 font-(family-name:--koruri-font) rounded-md text-content-text-light dark:text-content-text-dark bg-gray-200 dark:bg-gray-800">{childrenJsx}</code>

        // script
        // noscript もついでに
        case "script":
            const src = element.properties['src']?.toString()
            const type = element.properties['type']?.toString()
            return <ClientScriptRender src={src} type={type}>{childrenJsx}</ClientScriptRender>
        case "noscript":
            return <noscript>{childrenJsx}</noscript>

        // iframe
        // どのキーがあるか分からないので、スプレッドで
        case "iframe":
            return <iframe {...element.properties}>{childrenJsx}</iframe>

        // セクション
        case "section":
            return <section>{childrenJsx}</section>

        // 折りたたみ
        case "details":
            return <details>{childrenJsx}</details>
        case "summary":
            return <summary>{childrenJsx}</summary>

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