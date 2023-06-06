import { collection, doc, getDocs, increment, writeBatch } from 'firebase/firestore';
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
        }catch (error: any){
            console.log('get my snippets error', error)
            setError(error.message)
        }
    }

    const joinCommunity = async (communityData: Community) => {
        
        try{
            const batch = writeBatch(firestore);
            //create new community snippet for user
            const newSnippet: CommunitySnippet = {
                communityId: communityData.id,
                imageURL: communityData.imageURL || "",
            };

            batch.set(doc(firestore, `user/${user?.uid}/communitySnippets`, communityData.id), newSnippet)

            //updating the number of members in the commuity
            batch.update(doc(firestore, 'communities', communityData.id),{
                numberOfMembers: increment(1)
            })

            await batch.commit()

            //update recoil state - communityState.mySnippets
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: [...prev.mySnippets, newSnippet]
            }));

        } catch(error: any){
            console.log('join community error', error)
            setError(error.message)
        }

        setLoading(false)
    };

    const leaveCommunity = async (communityId: string) => {
        //cdelete community snippet for user
        //updating the number of members in the commuity

        //update recoil state - communityState.mySnippets

        try {
            const batch = writeBatch(firestore);

            batch.delete(doc(firestore,`user/${user?.uid}/communitySnippets`, communityId ))

            batch.update(doc(firestore, 'communities', communityId),{
                numberOfMembers: increment(-1)
            })

            //update recoil state - communityState.mySnippets
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: prev.mySnippets.filter( item => item.communityId !== communityId)
            }));
            
            await batch.commit();
        } catch (error: any) {
            console.log('leave community error', error)
            setError(error.message)
        }

        setLoading(false)
    };

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