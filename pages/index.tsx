import { GetStaticProps } from 'next';
import Head from 'next/head';
import MakingAppCard from '../components/MakingAppCard';
import ProfileCard from '../components/ProfileCard';
import Spacer from '../components/Spacer';
import { MakingAppData } from '../src/data/MakingAppData';
import JsonFolderManager from '../src/JsonFolderManager';

/** HomePage へ渡すデータ */
type HomePageProps = {
    /** ランダムメッセージの配列 */
    randomMessageList: Array<string>,
    /** 作ったアプリ配列 */
    makingAppList: Array<MakingAppData>
}

/** 最初に表示する画面 */
const HomePage: React.FC<HomePageProps> = (props) => {
    return (
        <>
            <Head>
                <title>トップページ - たくさんの自由帳</title>
            </Head>
            <ProfileCard randomMessageList={props.randomMessageList} />
            <Spacer value={1} />
            <MakingAppCard makingAppList={props.makingAppList} />
        </>
    )
};

/**
 * ランダムメッセージと作ったアプリをJSONから読み出してPropsで渡す
 * 
 * 静的書き出し時に呼ばれます
 */
export const getStaticProps: GetStaticProps<HomePageProps> = async context => {
    // ランダムメッセージ
    const randomMessageList = await JsonFolderManager.getRandomMessageList()
    // 作ったアプリ
    const makingLovers = await JsonFolderManager.getMakingAppMap()
    const returnPrpos: HomePageProps = {
        makingAppList: makingLovers,
        randomMessageList: randomMessageList
    }
    return {
        props: returnPrpos
    }
}

export default HomePage