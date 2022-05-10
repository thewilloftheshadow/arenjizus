import {
    Heading,
    Avatar,
    Box,
    Image,
    Flex,
    Text,
    Stack,
    Button,
    useColorModeValue,
} from "@chakra-ui/react"
import Link from "next/link"

export default function ArcherCard({ archer }) {
    return (
        <Box
            maxW={"270px"}
            w={"full"}
            bg={useColorModeValue("white", "gray.800")}
            boxShadow={"dark-lg"}
            rounded={"md"}
            overflow={"hidden"}
        >
            <Box p={6}>
                <Stack spacing={15} align={"center"} mb={5}>
                    <Heading
                        fontSize={"2xl"}
                        fontWeight={500}
                        fontFamily={"body"}
                    >
                        {archer.name}
                    </Heading>
                </Stack>

                <Stack direction={"row"} justify={"center"} spacing={6} mt={10}>
                    <Stack spacing={0} align={"center"}>
                        <Text fontWeight={600}>{archer.best ?? "??"}</Text>
                        <Text fontSize={"sm"} color={"gray.500"}>
                            Best Round
                        </Text>
                    </Stack>
                    <Stack spacing={0} align={"center"}>
                        <Text fontWeight={600}>{archer.count ?? "??"}</Text>
                        <Text fontSize={"sm"} color={"gray.500"}>
                            Score Count
                        </Text>
                    </Stack>
                </Stack>

                <Link href={`/archers/${archer.id}`} passHref>
                    <Button
                        w={"full"}
                        mt={8}
                        bg={useColorModeValue("blue.500", "blue.500")}
                        color={"white"}
                        rounded={"md"}
                        _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                        }}
                    >
                        View Archer
                    </Button>
                </Link>
            </Box>
        </Box>
    )
}
