/* eslint-disable @next/next/no-html-link-for-pages */
import { useUser, getSession } from "@auth0/nextjs-auth0"
import Head from "next/head"
import { Button, Center, Heading, VStack, Text } from "@chakra-ui/react"
import { MdMailOutline } from "react-icons/md"
import Link from "next/link"

export default function Index() {
    const { user, error, isLoading } = useUser()

    return (
        <>
            <Head>
                <title>Home | Advanced Mafia</title>
            </Head>
            <Center verticalAlign={"justify"}>
                <VStack spacing={{ base: 4 }}>
                    <Heading>This is an admin page!!</Heading>

                    <Link href={"/contact"} passHref>
                        <Button
                            bgColor={"blue.500"}
                            color={"white"}
                            size="lg"
                            leftIcon={<MdMailOutline />}
                            _hover={{
                                transform: "translateY(-2px)",
                                boxShadow: "lg",
                            }}
                        >
                            Contact Us
                        </Button>
                    </Link>
                </VStack>
            </Center>
        </>
    )
}
