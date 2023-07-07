"use client"

import { useState } from "react"
import EnvironmentTool from "../../src/EnvironmentTool"

/** 検索 API URL */
const URL = EnvironmentTool.SEARCH_API_URL

/** 検索 API のレスポンス JSON */
type SearchAPIResponse = {
    /** 型判定用 */
    status: 'successful'
    /** 検索結果 */
    result: SearchItem[]
}

type SearchItem = {
    /** タイトル */
    title: string
    /** リンク */
    link: string
}

/** エラー */
type SearchAPIError = {
    /** 型判定用 */
    status: 'error'
    /** エラー */
    error: Error
}

/** レスポンスの型 */
export type Response = SearchAPIResponse | SearchAPIError

/**
 * 検索 API を叩くカスタムフック
 * 
 * @link Response
 * @returns 検索 API を叩く関数と、検索結果かエラーを返す値
 */
export default function useSearchAPI() {
    const [searchAPIResponse, setSearchAPIResponse] = useState<Response>()

    function search(word: string) {
        fetch(`${URL}?query=${word}`)
            .then((res) => res.json())
            .then((json) => setSearchAPIResponse({
                status: 'successful',
                result: json['result']
            }))
            .catch(() => setSearchAPIResponse({
                status: 'error',
                error: Error('API 呼び出しに失敗しました')
            }))
    }

    return { search, searchAPIResponse }
}