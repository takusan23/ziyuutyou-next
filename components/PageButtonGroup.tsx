import Button from "./Button";
import NextLinkButton from "./NextLinkButton";

/** PageButtonGruop に渡す Props */
type PageButtonGruopProps = {
    /** ページ番号の配列。1 始まりで */
    pageNumberList: number[]
    /** 今のページ。1 始まりで。 */
    currentPage: number
    /** ページネーションのベース URL /posts/page/ など。 */
    baseUrl: string
}

/**  */
export default function PageButtonGruop({ pageNumberList, currentPage, baseUrl }: PageButtonGruopProps) {
    // 次のページ、前のページがあれば番号
    const nextPageParam = pageNumberList.includes(currentPage + 1) ? currentPage + 1 : null
    const prevPageParam = pageNumberList.includes(currentPage - 1) ? currentPage - 1 : null

    return (
        <div className="flex flex-row p-2 items-center justify-center space-x-3 rounded-full">
            {
                // 前のページボタンを出すか。
                // 無い場合は Disabled なボタンを出す
                prevPageParam ? <NextLinkButton
                    variant="contained"
                    href={`${baseUrl}${prevPageParam}/`}
                    text="前のページ"
                    rounded={{ startTop: 'large', startBottom: 'large', endTop: 'small', endBottom: 'small' }}
                /> : <Button
                    isDisabled
                    text="最新だよ"
                    rounded={{ startTop: 'large', startBottom: 'large', endTop: 'small', endBottom: 'small' }}
                />
            }

            {
                // 前後のページ番号を表示する
                [currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
                    .filter((pageNumber) => pageNumberList.includes(pageNumber))
                    .map((pageNumber) => <NextLinkButton
                        key={pageNumber}
                        variant="outlined"
                        href={`${baseUrl}${pageNumber}/`}
                        rounded={
                            // 今の番号は丸く
                            (pageNumber === currentPage)
                                ? { startTop: 'large', startBottom: 'large', endTop: 'large', endBottom: 'large' }
                                : { startTop: 'small', startBottom: 'small', endTop: 'small', endBottom: 'small' }
                        }
                        text={pageNumber.toString()} />
                    )
            }

            {
                // 次のページを出すか。
                nextPageParam ? <NextLinkButton
                    variant="contained"
                    href={`${baseUrl}${nextPageParam}/`}
                    text="次のページ"
                    rounded={{ startTop: 'small', startBottom: 'small', endTop: 'large', endBottom: 'large' }}
                /> : <Button
                    isDisabled
                    text="追いついた...!?"
                    rounded={{ startTop: 'small', startBottom: 'small', endTop: 'large', endBottom: 'large' }}
                />
            }
        </div>
    )
}