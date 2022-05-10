import { Box, Heading, Stack, Text } from "@chakra-ui/react"

export default function EventCard({ event }) {
    return (
        <Box
            key={event.id}
            minWidth={"750px"}
            bg={"white"}
            boxShadow={"2xl"}
            rounded={"md"}
            overflow={"hidden"}
        >
            <Box p={6}>
                <Stack spacing={0} align={"center"} mb={5}>
                    <Heading
                        fontSize={"2xl"}
                        fontWeight={500}
                        fontFamily={"body"}
                    >
                        {event.name}
                    </Heading>
                    <Text color={"gray.500"}>{event.description}</Text>
                </Stack>

                <Stack direction={"row"} justify={"center"} spacing={6}>
                    <Stack spacing={0} align={"center"}>
                        <Text fontWeight={600}>Location</Text>
                        <Text fontSize={"sm"} color={"gray.500"}>
                            {event.location}
                        </Text>
                    </Stack>
                    <Stack spacing={0} align={"center"}>
                        <Text fontWeight={600}>Date</Text>
                        <Text fontSize={"sm"} color={"gray.500"}>
                            {event.date.toISOString()}
                        </Text>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    )
}
