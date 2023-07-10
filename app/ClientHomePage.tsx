// Material-UI を使うため クライアントコンポーネント
"use client"

import LinkCard from "../components/LinkCard";
import MakingAppCard from "../components/MakingAppCard";
import ProfileCard from "../components/ProfileCard";
import Spacer from "../components/Spacer";
import LinkData from "../src/data/LinkData";
import { MakingAppData } from "../src/data/MakingAppData";

/** ClientHomePage へ渡すデータ */
type ClientHomePageProps = {
    /** ランダムメッセージの配列 */
    randomMessageList: Array<string>,
    /** 作ったアプリ配列 */
    makingAppList: MakingAppData[],
    /** リンク集 */
    linkList: LinkData[]
}

/** 最初に表示する画面 */
export default function ClientHomePage(props: ClientHomePageProps) {
    return (
        <>
            <ProfileCard randomMessageList={props.randomMessageList} />
            <Spacer value={1} />
            <LinkCard linkList={props.linkList} />
            <Spacer value={1} />
            <MakingAppCard makingAppList={props.makingAppList} />
        </>
    )
}