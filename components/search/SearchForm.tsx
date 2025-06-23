import Form from 'next/form'
import IconParent from "../IconParent"
import SearchIcon from "../../public/icon/search.svg"

/** SearchForm に渡すデータ */
type SearchFormProps = {
    /** 検索ワード */
    searchWord: string
}

/**
 * 検索フォーム <form>
 * 検索するとクエリパラメータ付きで画面遷移します
 */
export default function SearchForm({ searchWord }: SearchFormProps) {
    // method="get" なので
    // form 確定したら /search/q={検索ワード} のページに遷移する
    return (
        <Form
            className="search-form flex flex-row w-full space-x-2 py-2 px-4 rounded-full bg-container-primary-light dark:bg-container-primary-dark"
            action="/search/"
        >

            <input
                className="grow focus:outline-hidden bg-transparent py-1 text-content-text-light dark:text-content-text-dark"
                type="input"
                placeholder="検索ワード"
                name="q"
                defaultValue={searchWord} />

            <button type="submit">
                <IconParent>
                    <SearchIcon />
                </IconParent>
            </button>
        </Form>
    )
}
