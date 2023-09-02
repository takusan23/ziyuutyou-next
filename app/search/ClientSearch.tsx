"use client"

import { useState } from "react"
import useSearchAPI, { Response } from "./useSearchAPI"
import RoundedCornerList from "../../components/RoundedCornerList"
import Link from "next/link"
import SearchIcon from "../../public/icon/search.svg"
import IconParent from "../../components/IconParent"

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
function SearchForm({ text, onChange, onExecure }: SearchFormProps) {
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
                className="grow focus:outline-none bg-transparent text-content-text-light dark:text-content-text-dark"
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

/** SearchResult へ渡すデータ */
type SearchResponseProps = {
    /** API レスポンス */
    response: Response
}

/** 検索結果を表示する */
function SearchResult({ response }: SearchResponseProps) {
    return (
        <div className="flex flex-col items-center space-y-4">
            {
                // 成功したらリストで表示する
                // 失敗時はエラーメッセージ
                response && response.status === 'successful' ? (
                    <RoundedCornerList
                        list={response.result}
                        content={(className, result) => (
                            <div
                                className={`p-3 bg-container-primary-light dark:bg-container-primary-dark ${className}`}
                                key={result.link}
                            >
                                <Link href={result.link}>
                                    <h2 className="text-content-primary-light dark:text-content-primary-dark text-2xl underline">
                                        {result.title}
                                    </h2>
                                </Link>
                            </div>
                        )
                        }
                    />
                ) : (
                    <h2>
                        {response?.error?.message}
                    </h2>
                )
            }
        </div>
    )
}

/** 検索画面のクライアントコンポーネント。useState / onClick / fetch はクライアントコンポーネントでしか使えないので */
export default function CllientSearch() {
    const [searchWord, setSearchWord] = useState('')
    const { search, searchAPIResponse } = useSearchAPI()

    return (
        <div className="flex flex-col items-center w-full space-y-6">

            <SearchForm
                text={searchWord}
                onChange={setSearchWord}
                onExecure={() => search(searchWord)}
            />

            {
                searchAPIResponse && <SearchResult response={searchAPIResponse} />
            }

            <p className="text-content-primary-light dark:text-content-primary-dark">
                超簡易的な検索ができます（ベータ版）
            </p>
        </div >
    )
}