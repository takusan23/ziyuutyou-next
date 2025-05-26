"use client"

import IconParent from "../IconParent"
import SearchIcon from "../../public/icon/search.svg"

/** SearchForm に渡すデータ */
type SearchFormProps = {
    /** テキスト */
    text: string
    /** テキスト変更したら呼ばれる */
    onChange: (text: string) => void
    /** Enter / 検索 を押したときに呼ばれる */
    onExecure: () => void
}

/** 検索フォーム <form>  */
export default function SearchForm({ text, onChange, onExecure }: SearchFormProps) {
    // form でくくることで、Enter キー投下と検索ボタンの両方のイベントを onSubmit で受け取れる
    return (
        <form
            className="search-form flex flex-row w-full space-x-2 py-2 px-4 rounded-full bg-container-primary-light dark:bg-container-primary-dark"
            onSubmit={(ev) => {
                // preventDefault を使うことで、form に元からあるリクエスト機能を無効にできる
                ev.preventDefault()
                // 空文字以外
                if (text) {
                    onExecure()
                }
            }}
        >

            <input
                className="grow focus:outline-hidden bg-transparent py-1 text-content-text-light dark:text-content-text-dark"
                type="input"
                placeholder="検索ワード"
                value={text}
                onChange={(ev) => onChange(ev.target.value)} />

            <button type="submit">
                <IconParent>
                    <SearchIcon />
                </IconParent>
            </button>
        </form>
    )
}
