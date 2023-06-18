import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
import { communityState } from "../atoms/communitiesAtom";
import { Post, postState, PostVote } from "../atoms/postsAtom";
import { auth, firestore, storage } from "../firebase/clientApp";

const usePosts = () => {
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const [user] = useAuthState(auth);
  const currentCommunity = useRecoilValue(communityState).currentCommunity;
  const setAuthModalState = useSetRecoilState(authModalState)
  const router = useRouter();

  const onVote = async (post: Post, vote: number, communityId: string) => {
    //check if user is logged in, if not open the auth modal
    if(!user?.uid){
        setAuthModalState({ open: true, view: 'login'});
        return;
    }
    try {
      const { voteStatus } = post;
      const existingVote = postStateValue.postVotes.find(
        (vote) => vote.postId === post.id
      );
      const batch = writeBatch(firestore);
      const updatedPost = { ...post };
      const updatedPosts = [...postStateValue.posts];
      let updatedPostVotes = [...postStateValue.postVotes];
      let voteChange = vote;

      //New vote
      if (!existingVote) {
        const postVoteRef = doc(
          collection(firestore, "users", `${user?.uid}/postVotes`)
        );

        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id!,
          communityId,
          voteValue: vote, //1 or -1
        };

        batch.set(postVoteRef, newVote);
        //add or subtract 1 from post.voteStatus
        updatedPost.voteStatus = voteStatus + vote;

        updatedPostVotes = [...updatedPostVotes, newVote];
        //create new postVote document
      } else {
        const postVoteRef = doc(
          firestore,
          "users",
          `${user?.uid}/postVotes/${existingVote.id}`
        );
        //the have voted on the document before
        if (existingVote.voteValue === vote) {
          // add or subtract 1 on the post.voteStatus
          voteChange *= -1;
          updatedPost.voteStatus = voteStatus - vote;

          updatedPostVotes = updatedPostVotes.filter(
            (vote) => vote.id !== existingVote.id
          );
          // remove postVote document

          batch.delete(postVoteRef);

          //flipping their vote
        } else {
          // add or subtract 2 on the post.voteStatus
          updatedPost.voteStatus = voteStatus + 2 * vote;

          const voteIdx = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          );

          updatedPostVotes[voteIdx] = {
            ...existingVote,
            voteValue: vote,
          };

          voteChange = 2 * vote;
        }
      }

      //update post document
      const postRef = doc(firestore, "posts", post.id!);
      batch.update(postRef, { voteStatus: voteStatus + voteChange });

      await batch.commit();

      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      );
      updatedPosts[postIdx] = updatedPost;
      // updating the existing postVote document
      setPostStateValue((prev) => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedPostVotes,
      }));
    } catch (error) {
      console.log("onVote error", error);
    }
  };

  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) =>({
        ...prev,
        selectedPost: post,
    }))
    router.push(`${post.communityId}/comments/${post.id}`)
  };

  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      //check if there is an image and delete
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`);
        await deleteObject(imageRef);
      }

      //delete post document from firestore
      const postDocRef = doc(firestore, "posts", post.id!);
      await deleteDoc(postDocRef);

      //update recoil state
      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
      }));
      return true;
    } catch (error: any) {
      return false;
    }
  };
  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, "users", `${user?.uid}/postVotes`),
      where("communityId", "==", communityId)
    );

    const postVoteDocs = await getDocs(postVotesQuery);
    const postVotes = postVoteDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[]
    }))
  };

  useEffect(() => {
    if(!currentCommunity?.id || !user) return;
    getCommunityPostVotes(currentCommunity?.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentCommunity]);

  useEffect(() => {
    if(!user){
        setPostStateValue((prev) => ({
            ...prev,
            postVotes: []
        }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  };
};
export default usePosts;
