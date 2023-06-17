import { Metadata } from "next";
import JsonFolderManager from "../src/JsonFolderManager";
import ClientHomePage from "./ClientHomePage";

/** <head> に入れる値 */
export const metadata: Metadata = {
    title: 'トップページ - たくさんの自由帳'
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

    return (<ClientHomePage randomMessageList={randomMessageList} makingAppList={makingAppList} linkList={linkList} />)
}