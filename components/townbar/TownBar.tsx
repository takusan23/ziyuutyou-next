import TownTrafficImage from "../../public/townbar/town_traffic.svg"
import TownTrainImage from "../../public/townbar/town_train.svg"
import TownHouseImage from "../../public/townbar/town_house.svg"
import TownStoreImage from "../../public/townbar/town_store.svg"

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
            <TownTrafficImage />
            <TownHouseImage />
        </div>
    )
}