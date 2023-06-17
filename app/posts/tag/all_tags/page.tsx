import { Metadata } from "next";
import ClientAllTagsPage from "./ClientAllTagPage";
import ContentFolderManager from "../../../../src/ContentFolderManager";

/** head に値を入れる */
export const metadata: Metadata = {
    title: 'タグ一覧 - たくさんの自由帳'
}

/** タグ一覧ページ */
export default async function ClientAllTagPage() {
    const tagDataList = await ContentFolderManager.getAllTagDataList()

    return <ClientAllTagsPage tags={tagDataList} tagCount={tagDataList.length} />
}