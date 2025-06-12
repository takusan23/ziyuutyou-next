/** ページネーション。ジェネリクスで汎用 */
type Pagination<T> = {
    /** 合計数 */
    totalCount: number
    /** T が 1 ページ分入った配列、それの配列 */
    pageList: T[][]
    /** ページネーションの番号の配列。1 始まり */
    pageNumberList: number[]
}

export default Pagination