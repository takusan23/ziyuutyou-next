import { Metadata } from "next";
import EnvironmentTool from "../src/EnvironmentTool";
import Icon from "../components/Icon";

/** <head> に入れる値 */
export const metadata: Metadata = {
    title: `404 - ${EnvironmentTool.SITE_NAME}`
}

/** 404ページ */
export default function NotFound() {
    return (
        <div className="flex flex-col items-center space-y-4">
            <Icon
                iconStyle="mask-[url('/not_found.svg')]"
                color="theme"
                className="w-96 h-52"
                ariaLabel="縦棒が l か 1 か I のどれなのか分からなくて困っている画像" />
            <h1 className="text-content-primary-light dark:text-content-primary-dark text-3xl">
                404 - 見つかりませんでした
            </h1>
            <p className="text-content-primary-light dark:text-content-primary-dark">
                そこになければ無いですね。
            </p>
            <p className="text-content-primary-light dark:text-content-primary-dark">
                URLを確認してみてください。
            </p>
        </div>
    )
}