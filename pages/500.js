import { Box, Heading, Text, Button } from "@chakra-ui/react"
import Link from "next/link"

export default function NotFound() {
    return (
        <Box textAlign="center" py={10} px={6}>
            <Heading
                display="inline-block"
                as="h2"
                size="2xl"
                bgGradient="linear(to-r, blue.500, blue.600)"
                backgroundClip="text"
            >
                500
            </Heading>
            <Text fontSize="18px" mt={3} mb={2}>
                Internal Server Error
            </Text>
            <Text color={"gray.500"} mb={6}>
                An internal error has occurred. The developers have been
                notified and are looking into the issue.
            </Text>

            <Link href="/" passHref>
                <Button
                    colorScheme="blue"
                    bgGradient="linear(to-r, blue.400, blue.500)"
                    color="white"
                    variant="solid"
                >
                    Go to Home
                </Button>
            </Link>
        </Box>
    )
}
