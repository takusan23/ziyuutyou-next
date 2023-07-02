import { Metadata } from "next";
import ClientAllTagsPage from "./ClientAllTagPage";
import ContentFolderManager from "../../../../src/ContentFolderManager";
import EnvironmentTool from "../../../../src/EnvironmentTool";

/** head に値を入れる */
export const metadata: Metadata = {
    title: `タグ一覧 - ${EnvironmentTool.SITE_NAME}`
}

/** タグ一覧ページ */
export default async function ClientAllTagPage() {
    const tagDataList = await ContentFolderManager.getAllTagDataList()

    return <ClientAllTagsPage tags={tagDataList} tagCount={tagDataList.length} />
}