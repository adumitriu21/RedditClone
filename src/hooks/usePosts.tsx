import { collection, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import { Post, postState, PostVote } from '../atoms/postsAtom';
import { auth, firestore, storage } from '../firebase/clientApp';


const usePosts = () => {
    const [postStateValue, setPostStateValue] = useRecoilState(postState)
    const [user] = useAuthState(auth);
    const onVote = async(post:Post, vote: number, communityId: string) => {
        //check if user is logged in, if not open the auth modal
        try {
            const {voteStatus} = post;
            const existingVote = postStateValue.postVotes.find(
                (vote) => vote.postId === post.id
            )
            const batch = writeBatch(firestore)
            const updatedPost = {...post}
            const updatedPosts = [...postStateValue.posts]
            const updatedPostVotes = [...postStateValue.posts]
            let voteChange = vote;

            //New vote
            if(!existingVote){

                const postVoteRef = doc(collection(firestore, 'users', `${user?.uid}/postVotes`))

                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote //1 or -1
                }

                batch.set(postVoteRef, newVote)
                //add or subtract 1 from post.voteStatus
                updatedPost.voteStatus = voteStatus + vote

                updatedPostVotes = [...updatedPostVotes, newVote]
                //create new postVote document
            } else {
                //the have voted on the document before
                if(removingVote){
                    // add or subtract 1 on the post.voteStatus
                    // remove postVote document
                } else {
                    // add or subtract 2 on the post.voteStatus
                    // updating the existing postVote document 
                }
            }
        } catch (error) {
            console.log('onVote error', error)
        }
        
    };
    
    const onSelectPost = () => {};
    
    const onDeletePost = async(post:Post): Promise<boolean> => {

        try {
            //check if there is an image and delete
            if(post.imageURL){
                const imageRef = ref(storage, `posts/${post.id}/image`)
                await deleteObject(imageRef)
            }

            //delete post document from firestore
            const postDocRef = doc(firestore, 'posts', post.id!)
            await deleteDoc(postDocRef)

            //update recoil state
            setPostStateValue(prev => ({
                ...prev,
                posts: prev.posts.filter(item => item.id !== post.id)
            }))
        } catch (error: any) {
            
        }
        return true;
    };
    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost
    }
}
export default usePosts;