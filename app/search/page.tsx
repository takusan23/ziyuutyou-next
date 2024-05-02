import { Metadata } from "next"
import EnvironmentTool from "../../src/EnvironmentTool"
import PagefindSearch from "./PagefindSearch"

// <head> を定義
export const metadata: Metadata = {
    title: `記事検索 - ${EnvironmentTool.SITE_NAME}`
}

/** 検索ページ */
export default function SearchPage() {
    return (
        <PagefindSearch />
    )
}