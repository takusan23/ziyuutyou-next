import { Metadata } from "next"
import ContentFolderManager from "../../../../src/ContentFolderManager"
import EnvironmentTool from "../../../../src/EnvironmentTool"
import NextLinkButton from "../../../../components/NextLinkButton"
import SellIcon from "../../../../public/icon/sell.svg"
import Title from "../../../../components/Title"

/** head に値を入れる */
export const metadata: Metadata = {
    title: `タグ一覧 - ${EnvironmentTool.SITE_NAME}`
}

/** タグ一覧ページ */
export default async function ClientAllTagPage() {
    const tagDataList = await ContentFolderManager.getAllTagDataList()

    return (
        <div className="p-4 max-w-6xl m-auto flex flex-col space-y-4">

            <Title
                title="タグ一覧"
                subTitle={`${tagDataList.length} 件`} />

            <div className="flex flex-row flex-wrap gap-2">
                {
                    tagDataList.map(tagData => (
                        <NextLinkButton
                            key={tagData.name}
                            href={`/posts/tag/${tagData.name}/1/`}
                            startIcon={<SellIcon className="w-5 h-5" />}
                            text={`${tagData.name} - ${tagData.count} 件`}
                        />
                    ))
                }
            </div>
        </div>
    )
}