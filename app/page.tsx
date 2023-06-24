import { Metadata } from "next";
import JsonFolderManager from "../src/JsonFolderManager";
import ProfileCard from "../components/ProfileCard";
import EnvironmentTool from "../src/EnvironmentTool";

/** <head> に入れる値 */
export const metadata: Metadata = {
    title: `トップページ - ${EnvironmentTool.SITE_NAME}`,
    // Google Search Console の所有権確認
    verification: {
        google: EnvironmentTool.GOOGLE_SEARCH_CONSOLE
    }
}

/** 最初に表示されるページ */
export default async function Home() {
    // データを async/await を使って取得する
    // なんとなく並列にしてみた
    const [randomMessageList, makingAppList, linkList] = await Promise.all([
        // ランダムメッセージ
        JsonFolderManager.getRandomMessageList(),
        // 作ったアプリ
        JsonFolderManager.getMakingAppMap(),
        // リンク集
        JsonFolderManager.getLinkList()
    ])

    return (
        <div className="flex flex-col p-2">
            <ProfileCard randomMessageList={randomMessageList} />
        </div>
    )
}