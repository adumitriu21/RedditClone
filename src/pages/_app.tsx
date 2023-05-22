import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '@chakra-ui/react';
import Layout from '../components/layout/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Layout>
       <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp
