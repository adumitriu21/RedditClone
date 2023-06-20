import { Box, Flex } from "@chakra-ui/react";
import { User } from "firebase/auth";
import { collection, doc, serverTimestamp, Timestamp, writeBatch } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Post } from "../../../atoms/postsAtom";
import { firestore } from "../../../firebase/clientApp";
import CommentInput from "./CommentInput";

type CommentsProps = {
  user: User;
  selectedPost: Post | null;
  communityId: string;
};

export type Comment = {
    id: string,
    creatorId: string;
    creatorDisplayText: string;
    communityId: string,
    postId: string,
    postTitle: string;
    text: string;
    createdAt: Timestamp;
}

const Comments: React.FC<CommentsProps> = ({
  user,
  selectedPost,
  communityId,
}) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const onCreateComment = async () => {
    //create comment doc
    //update the post's number of comments
    try {
      const batch = writeBatch(firestore);
      
      const commentDocRef = doc(collection(firestore, 'comments'));

      const newComment: Comment = {
        id: commentDocRef.id,
        creatorId: user.uid,
        creatorDisplayText: user.email!.split('@')[0],
        communityId,
        postId: selectedPost?.id!,
        postTitle: selectedPost?.title!,
        text: commentText,
        createdAt: serverTimestamp() as Timestamp
      }

      batch.set(commentDocRef, newComment)

    } catch (error) {
        console.log('comment create error', error)
    }

    //update client recoil state
  };

  const onDeleteComment = async (comment: any) => {
    //delete comment doc
    //update post's number of comments

    //update client recoil state
  };

  const getPostComments = async () => {};

  useEffect(() => {
    getPostComments();
  }, []);
  return (
    <Box bg="white" borderRadius="0px 0px 4px 4px" p={2}>
      <Flex
        flexDirection="column"
        pl={10}
        pr={4}
        mb={6}
        fontSize="10pt"
        width="100%"
      >
        {
          <CommentInput
            commentText={commentText}
            setCommentText={setCommentText}
            user={user}
            createLoading={ createLoading } 
            onCreateComment={ onCreateComment }
          />
        }
      </Flex>
    </Box>
  );
};
export default Comments;
