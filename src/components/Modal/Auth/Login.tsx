import { Button, Flex, Input } from '@chakra-ui/react';
import React, { useState } from 'react';

type LoginProps = {
    
};

const Login:React.FC<LoginProps> = () => {
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
    })

    const onSubmit = () => {

    }

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        //update form state

        setLoginForm(prev => ({
            ...prev,
            [event.target.name]: event.target.value,
        }))
    }

    return (
        <form onSubmit={onSubmit}>
            <Input 
                required 
                name='email' 
                placeholder='email' 
                type='email' 
                mb={2} 
                onChange={onChange}
                fontSize='10pt'
                _placeholder={{color: 'gray.500'}}
                _hover={{
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'blue.500'
                }}
                _focus={{
                    outline: 'none',
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'blue.500'

                }}
                bg='gray.50'>

            </Input>
            <Input 
                required 
                name='password' 
                placeholder='password' 
                type='password' 
                mb={2} 
                onChange={onChange}
                fontSize='10pt'
                _placeholder={{color: 'gray.500'}}
                _hover={{
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'blue.500'
                }}
                _focus={{
                    outline: 'none',
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'blue.500'

                }}
                bg='gray.50'>

            </Input>
            <Button 
                width='100%' 
                height='36px' 
                mt={2} 
                mb={2} 
                type='submit'>
                    Log In
            </Button>
            <Flex fontSize='9px' justifyContent='center'>
                
            </Flex>
        </form>
        )
}
export default Login;