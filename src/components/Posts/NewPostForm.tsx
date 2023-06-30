import { Alert, AlertDescription, AlertIcon, AlertTitle, Flex, Icon } from "@chakra-ui/react";
import React, { useState } from "react";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { BiPoll } from "react-icons/bi";
import TextInputs from "./PostForm/TextInputs";
import ImageUpload from "./PostForm/ImageUpload";
import { Post } from "../../atoms/postsAtom";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import { addDoc, collection, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/clientApp";
import { getDownloadURL, ref } from "@firebase/storage";
import { uploadString } from "firebase/storage";
import useSelectFile from "../../hooks/useSelectFile";
import TabItem from "./TabItem";

type NewPostFormProps = {
    user: User;
    communityImageURL?: string;
};

const formTabs: TabItem[] = [
  {
    title: "Post",
    icon: IoDocumentText,
  },
  {
    title: "Images & Video",
    icon: IoImageOutline,
  },
  {
    title: "Link",
    icon: BsLink45Deg,
  },
  {
    title: "Poll",
    icon: BiPoll,
  },
  {
    title: "Talk",
    icon: BsMic,
  },
];

export type TabItem = {
  title: string;
  icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({ user , communityImageURL}) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
  });

  const {selectedFile, setSelectedFile, onSelectFile} = useSelectFile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false)

  const handleCreatePost = async () => {

    const {communityId} = router.query;
    //construct new post object => type Post
    const newPost : Post = {
        communityId: communityId as string,
        communityImageURL: communityImageURL || '',
        creatorId: user.uid,
        creatorDisplayName: user.email!.split('@')[0],
        title: textInputs.title,
        body: textInputs.body,
        numberOfComments: 0,
        voteStatus: 0,
        createdAt: serverTimestamp() as Timestamp,

    };

    setLoading(true)
    //store the post inside Post collection
    try {
        const postDocRef = await addDoc(collection(firestore, 'posts'), newPost) 

         //see if there is an image included in the post
         if(selectedFile){
            //store image in the separate storage
            const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
            await uploadString(imageRef, selectedFile, 'data_url');

            const downloadURL = await getDownloadURL(imageRef)
         //update the post with the img url
            await updateDoc(postDocRef, {
                imageURL: downloadURL,
            });

         };
        
         router.back();
       
        
    } catch (error) {
        console.log('handleCreatePost error: ', error)
        setError(true)
    }
   
    setLoading(false);

   
  };


  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event;
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Flex direction="column" bg="white" borderRadius={4} mt={2}>
      <Flex width="100%">
        {formTabs.map((item) => (
          // eslint-disable-next-line react/jsx-key
          <TabItem
            key={item.title}
            item={item}
            selected={item.title === selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ))}
      </Flex>
      <Flex p={4}>
        {selectedTab === "Post" && (
          <TextInputs
            textInputs={textInputs}
            handleCreatePost={handleCreatePost}
            onChange={onTextChange}
            loading={loading}
          />
        )}
        {selectedTab === "Images & Video" && (
          <ImageUpload
            onSelectImage={onSelectFile}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            setSelectedTab={setSelectedTab}
          />
        )}
      </Flex>
      { error && (
        <Alert status='error'>
        <AlertIcon />
        <AlertTitle>Error creting post</AlertTitle>
      </Alert>
      )}
    </Flex>
  );
};
export default NewPostForm;
function userRouter() {
    throw new Error("Function not implemented.");
}

