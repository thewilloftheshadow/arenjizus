/* eslint-disable @next/next/no-html-link-for-pages */
import styles from "../styles/Home.module.css"
import { useUser, getSession } from "@auth0/nextjs-auth0"
import Head from "next/head"
import {
    Button,
    Center,
    Heading,
    VStack,
    Text,
    Box,
    Container,
    SimpleGrid,
    Icon,
    Stack,
    HStack,
    Image
} from "@chakra-ui/react"
import { MdMailOutline } from "react-icons/md"
import Link from "next/link"
import { CheckIcon } from "@chakra-ui/icons"

// Replace test data with your own
const features = Array.apply(null, Array(8)).map(function (x, i) {
    return {
        id: i,
        title: "Lorem ipsum dolor sit amet",
        text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam.",
    }
})

export default function Index() {
    const { user, error, isLoading } = useUser()

    return (
        <>
            <Head>
                <title>Home | Advanced Mafia</title>
            </Head>
            <Center verticalAlign={"center"}>
                <VStack spacing={{ base: 4, lg: 8 }}>
                    <Image alt={"Logo"} width={"25%"}/>
                    <Stack
                        spacing={4}
                        as={Container}
                        maxW={"3xl"}
                        textAlign={"center"}
                    >
                        <Heading fontSize={"3xl"}>This is a title</Heading>
                        <Text color={"gray.600"} fontSize={"xl"}>
                            This is text about how amazing Advanced Mafia is.
                            Lorem ipsum dolor sit amet, consetetur sadipscing
                            elitr, sed diam nonumy eirmod tempor invidunt ut
                            labore et dolore magna aliquyam erat, sed diam
                            voluptua.
                        </Text>
                    </Stack>

                    <Container maxW={"6xl"} mt={10}>
                        <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 4 }}
                            spacing={10}
                        >
                            {features.map((feature) => (
                                <HStack key={feature.id} align={"top"}>
                                    <Box color={"green.400"} px={2}>
                                        <Icon as={CheckIcon} />
                                    </Box>
                                    <VStack align={"start"}>
                                        <Text fontWeight={600}>
                                            {feature.title}
                                        </Text>
                                        <Text color={"gray.600"}>
                                            {feature.text}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </Container>

                    <Link href={"mailto:coach@reachearchery.org"} passHref>
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
