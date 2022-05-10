import {
    Heading,
    Avatar,
    Box,
    Image,
    Flex,
    Text,
    Stack,
    Button,
    HStack,
    useColorModeValue,
} from "@chakra-ui/react"
import Link from "next/link"

export default function ScoreCard({ score }) {
    return (
        <Box
            maxW={"900px"}
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
                        {score.event.name}
                    </Heading>
                    <Text color={"gray.600"} fontSize={"xl"}>
                        {score.event.description ?? ""}
                    </Text>
                </Stack>

                <HStack padding={8}>
                    <Stack spacing={0} align={"center"}>
                        <Text fontWeight={600}>{score.total ?? "??"}</Text>
                        <Text fontSize={"sm"} color={"gray.500"}>
                            Flight Total Score
                        </Text>
                    </Stack>
                    {score.endTenMeter ? (
                        <Stack spacing={0} align={"center"}>
                            <Text fontWeight={600}>
                                {score.endTenMeter ?? "??"}
                            </Text>
                            <Text fontSize={"sm"} color={"gray.500"}>
                                Best End at 10m
                            </Text>
                        </Stack>
                    ) : null}
                    {score.endFifteenMeter ? (
                        <Stack spacing={0} align={"center"}>
                            <Text fontWeight={600}>
                                {score.endFifteenMeter ?? "??"}
                            </Text>
                            <Text fontSize={"sm"} color={"gray.500"}>
                                Best End at 15m
                            </Text>
                        </Stack>
                    ) : null}

                    {score.tens ? (
                        <Stack spacing={0} align={"center"}>
                            <Text fontWeight={600}>{score.tens ?? "??"}</Text>
                            <Text fontSize={"sm"} color={"gray.500"}>
                                Number of 10s
                            </Text>
                        </Stack>
                    ) : null}
                </HStack>
            </Box>
        </Box>
    )
}
