import MakingAppCard from '../components/MakingAppCard';
import ProfileCard from '../components/ProfileCard';
import Spacer from '../components/Spacer';

/** 最初に表示する画面 */
const HomePage = () => {

    return (
        <>
            <ProfileCard />
            <Spacer value={1}/>
            <MakingAppCard />
        </>
    )
};

export default HomePage