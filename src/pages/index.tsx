import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";
import { communityState } from "../atoms/communitiesAtom";
import { Post } from "../atoms/postsAtom";
import PageContent from "../components/Layout/PageContent";
import { auth, firestore } from "../firebase/clientApp";
import usePosts from "../hooks/usePosts";

const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const communityStateValue = useRecoilValue(communityState);
  const { setPostStateValue } = usePosts();

  const buildUserHomeFeed = () => {};

  const buildNoUserHomeFeed = async() => {
    setLoading(true);
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(10)
      );

      const postDocs = await getDocs(postQuery);
      const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data()}))

      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }));
      
    } catch (error) {
      console.log("build no user home feed", error);
    }
    setLoading(false);
  };

  const getUserPostVotes = () => {};

  useEffect(() => {
    if (!user && !loadingUser) buildNoUserHomeFeed();
  }, [user, loadingUser]);
  return (
    <PageContent>
      <>{/*PostFeed*/}</>
      <>{/*Recommendations*/}</>
    </PageContent>
  );
};

export default Home;
