import { Metadata } from "next"
import EnvironmentTool from "../../src/EnvironmentTool"
import CllientSearch from "./ClientSearch"

// <head> を定義
export const metadata: Metadata = {
    title: `検索（ベータ） - ${EnvironmentTool.SITE_NAME}`
}

/** 検索ページ。クライアントで API を叩くためほとんどクライアントコンポーネントになってます。 */
export default function SearchPage() {

    // 検索 API 利用しない場合は使えない旨を表示する
    return (
        <>
            {
                EnvironmentTool.SEARCH_API_URL
                    ? <CllientSearch />
                    : <p className="text-content-primary-light dark:text-content-primary-dark text-2xl">
                        未実装です...
                    </p>
            }
        </>
    )
}