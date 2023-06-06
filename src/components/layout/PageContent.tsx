import { Flex } from '@chakra-ui/react';
import React from 'react';

type PageContentProps = {
    
};

const PageContent:React.FC<{ children: React.ReactNode }> = ({ children }) => {
    
    return (
        <Flex border='1px solid red' justify='center' p='16px 0px'>
            <Flex border='1px solid green' width='95%' justify='center' maxWidth='860px'>
                {/* LHS container*/ }
                <Flex direction='column' width={{base:'100%', md:'65%'}} mr={{base:0, md:6}} border='1px solid blue'>
                    {children && children[0 as keyof typeof children]}
                </Flex>

                 {/* RHS container*/ }
                <Flex direction='column' display={{base:'none', md:'flex'}} flexGrow={1} border='1px solid orange'>
                    {children && children[1 as keyof typeof children]}
                </Flex>
            </Flex>
            
        </Flex>
    )
}
export default PageContent;