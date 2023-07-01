import { Metadata } from "next";
import EnvironmentTool from "../src/EnvironmentTool";
// 404 ページのアイコンの色を変えるための CSS
import "../styles/css/not-found.css"
// https://react-svgr.com/docs/next/ 参照
import NotFoundIcon from "../public/not_found.svg"

/** <head> に入れる値 */
export const metadata: Metadata = {
    title: `404 - ${EnvironmentTool.SITE_NAME}`
}

/** 404ページ */
export default function NotFound() {
    return (
        <div className="flex flex-col items-center space-y-4">
            <NotFoundIcon
                className={'theme_color'}
                height={200}
                width={400}
            />
            <h1 className="text-content-primary-light dark:text-content-primary-dark text-3xl">
                404 - 見つかりませんでした
            </h1>
            <p>そこになければ無いですね。</p>
            <p>URLを確認してみてください。</p>
        </div>
    )
}