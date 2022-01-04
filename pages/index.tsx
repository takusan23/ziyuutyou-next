import Head from 'next/head';
import MakingAppCard from '../components/MakingAppCard';
import ProfileCard from '../components/ProfileCard';
import Spacer from '../components/Spacer';

/** 最初に表示する画面 */
const HomePage = () => {

    return (
        <>
            <Head>
                <title>トップページ - たくさんの自由帳</title>
            </Head>
            <ProfileCard />
            <Spacer value={1} />
            <MakingAppCard />
        </>
    )
};

export default HomePage