import { doc, getDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { Community } from '../../../atoms/communitiesAtom';
import { firestore } from '../../../firebase/clientApp';
import safejsonstringify from 'safe-json-stringify';

type CommunityPageProps = {
    communityData: Community;
};

const CommunityPage:React.FC<CommunityPageProps> = ({ communityData }) => {
    
    return <div>Welcome to {communityData.id}</div>
}

export async function getServerSideProps(context: GetServerSidePropsContext){
    ///get community data 

    try{
        const communityDocRef = doc(firestore, 'communities', context.query.communityId as string);

        const communityDoc = await getDoc(communityDocRef);

        return { 
            props: {
            communityData : JSON.parse(safejsonstringify({ id: communityDoc.id, ...communityDoc.data() }))
        },
    };
    }catch (error){
        //could add error page here
        console.log('get serve side props error: ', error)
    }
}
export default CommunityPage;