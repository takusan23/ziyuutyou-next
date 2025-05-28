import { Suspense } from "react"
import { Metadata } from "next"
import PagefindSearch from "./PagefindSearch"
import EnvironmentTool from "../../src/EnvironmentTool"

// <head> を定義
export const metadata: Metadata = {
    title: `記事検索 - ${EnvironmentTool.SITE_NAME}`
}

/** 検索ページ */
export default function SearchPage() {
    return (
        <Suspense>
            <PagefindSearch />
        </Suspense>
    )
}