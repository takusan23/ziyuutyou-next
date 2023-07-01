import { Metadata } from "next";
import ContentFolderManager from "../../../../src/ContentFolderManager";
import EnvironmentTool from "../../../../src/EnvironmentTool";
import NextLinkButton from "../../../../components/NextLinkButton";
import MenuIcon from "../../../../public/icon/material-menu.svg"

/** head に値を入れる */
export const metadata: Metadata = {
    title: `タグ一覧 - ${EnvironmentTool.SITE_NAME}`
}

/** タグ一覧ページ */
export default async function ClientAllTagPage() {
    const tagDataList = await ContentFolderManager.getAllTagDataList()

    return (
        <div className="flex flex-col space-y-4">

            <div>
                <h1 className="text-content-primary-light text-3xl">
                    タグ一覧
                </h1>
                <h3 className="text-content-primary-light text-lg">
                    {`${tagDataList.length} 件`}
                </h3>
            </div>

            <div className="flex flex-row flex-wrap gap-2">
                {
                    tagDataList.map(tagData => (
                        <NextLinkButton
                            key={tagData.name}
                            href={`/posts/tag/${tagData.name}/`}
                            startIcon={<MenuIcon className="w-5 h-5" />}
                            text={`${tagData.name} - ${tagData.count} 件`}
                        />
                    ))
                }
            </div>
        </div>
    )
}