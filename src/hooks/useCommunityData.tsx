import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import { Community, CommunitySnippet, communityState } from '../atoms/communitiesAtom';
import { auth, firestore } from '../firebase/clientApp';


const useCommunityData = () => {
    const [user] = useAuthState(auth);
    const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
   
    const onJoinOrLeaveCommunity = (communityData: Community, isJoined: boolean) => {
        // is the user signed in
            //if not open auth modal 

        //are they joined in the community
        if(isJoined){
            leaveCommunity(communityData.id);
            return;
        }

        joinCommunity(communityData)
    }

    const getMySnippets = async() => {
        setLoading(true);
        try{
            const snippetDocs = await getDocs(collection(firestore, `user/${user?.uid}/communitySnippets`));
            const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));

            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: snippets as CommunitySnippet[]
            }))

            console.log('user snippets', snippets)
            console.log('community state value', communityStateValue)
        }catch (error){
            console.log('get my snippets error', error)
        }
    }

    const joinCommunity = (communityData: Community) => {};

    const leaveCommunity = (communityId: string) => {};

    useEffect(() => {
        if(!user) return;
        getMySnippets();
 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    return {
        communityStateValue,
        onJoinOrLeaveCommunity
    }
 
}
export default useCommunityData;