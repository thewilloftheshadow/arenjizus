import "../styles/globals.css"
import React from "react"
import { UserProvider } from "@auth0/nextjs-auth0"
import { ChakraProvider } from "@chakra-ui/react"
import Layout from "../components/Layout"

export default function App({ account, Component, pageProps }) {
    return (
        <ChakraProvider>
            <UserProvider>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </UserProvider>
        </ChakraProvider>
    )
}
