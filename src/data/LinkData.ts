/** リンク集のデータ */
type LinkData = {
    /** 名前 */
    name: string
    /** TwitterとかのID */
    description: string
    /** リンク */
    href: string
    /** rel="me" したい場合は "me" を渡す */
    rel: string | undefined
}

export default LinkData