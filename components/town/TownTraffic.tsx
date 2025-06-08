import TownTrafficImage from "../../public/town_traffic.svg"
import TownTrainImage from "../../public/town_train.svg"
import TownHouseImage from "../../public/town_house.svg"
import TownStoreImage from "../../public/town_store.svg"

// 横に移動させる CSS
import "./town-traffic.css"

export default function TownBar() {
    return (
        <div className="flex flex-col space-y-8 justify-center" id="icon_parent">
            <TownHouseImage />
            <TownTrafficImage />
            <TownStoreImage />
            <TownTrainImage />
            <TownHouseImage />
        </div>
    )
}