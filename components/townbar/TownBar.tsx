import fs from "fs/promises"
import path from "path"

// 横に移動させる CSS
// アニメーションの @keyframes は多分ありのままの CSS のが早い
import "./town-bar.css"

/** 画面が大きいときに出している絵。街です。 */
export default function TownBar() {
    // viewport（ブラウザのウィンドウ）の高さで真ん中、
    // スクロールしても追従するように sticky
    return (
        <div className="flex flex-col h-screen sticky top-0 space-y-5 py-2 justify-end [&_path]:fill-content-primary-light! [&_path]:dark:fill-content-primary-dark!" id="icon_parent">
            {/* todo とりあえず２つにする */}
            {/* <TownHouseImage /> */}
            {/* <TownTrainImage /> */}
            {/* <TownStoreImage /> */}
            <SvgFromFile name="town_traffic.svg" />
            <SvgFromFile name="town_house.svg" />
        </div>
    )
}

/** 
 * --- ローカルにある SVG を貼り付けているだけ ---
 * SVGR を消したのでなくなった...
 */

type SvgFromFileProps = {
    name: string
}
async function SvgFromFile({ name }: SvgFromFileProps) {
    const svg = await fs.readFile(path.join(process.cwd(), `public`, `townbar`, name), { encoding: 'utf-8', })
    return (<div dangerouslySetInnerHTML={{ __html: svg }} />)
}