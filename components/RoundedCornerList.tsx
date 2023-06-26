import { ReactNode } from "react"

/** RoundedCornerList へ渡すデータ */
type RoundedCornerListProps<T> = {

    /** リストに表示する配列 */
    list: T[]

    /**
     * リストの各レイアウトを返してください
     * 
     * @param className 各レイアウトに適用する css
     * @param item 対応するデータ
     */
    content: (className: string, item: T) => ReactNode
}

/** 各レイアウトの角が丸いリスト。先頭と最後尾はより丸くする。 */
export default function RoundedCornerList<T>({ list, content }: RoundedCornerListProps<T>) {
    // flex つけないとマージンうまくかかんない？
    return (
        <div className="flex flex-col space-y-2">
            {
                list.map((item, index) => {

                    let roundedClassName: string
                    if (list.length === 1) {
                        // アイテム数が 1 のとき
                        roundedClassName = 'rounded-3xl'
                    } else if (index === 0) {
                        // 先頭は上の辺をより丸くする
                        roundedClassName = 'rounded-b-lg rounded-t-3xl'
                    } else if ((index + 1) === list.length) {
                        // 最後はその逆
                        roundedClassName = 'rounded-b-3xl rounded-t-lg'
                    } else {
                        roundedClassName = 'rounded-lg'
                    }

                    return content(roundedClassName, item)
                })
            }
        </div>
    )
}