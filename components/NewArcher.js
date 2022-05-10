import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Link,
    Button,
    Heading,
    Text,
    useColorModeValue,
} from "@chakra-ui/react"


export default function NewArcher() {
    return (
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
            <Stack align={"center"}>
                <Heading fontSize={"4xl"}>Add a new archer</Heading>
                <Text fontSize={"lg"} color={"gray.600"}>
                    They will be listed under your account
                </Text>
            </Stack>
            <Box
                rounded={"lg"}
                bg={useColorModeValue("white", "gray.700")}
                boxShadow={"dark-lg"}
                p={8}
            >
                <Stack spacing={4}>
                    <FormControl id="name">
                        <FormLabel>Archer&apos;s Name</FormLabel>
                        <Input type="text" />
                    </FormControl>
                    {/* <FormControl id="password">
                            <FormLabel>Password</FormLabel>
                            <Input type="password" />
                        </FormControl> */}
                    <Stack spacing={10}>
                        <Button
                            bg={"green.400"}
                            color={"white"}
                            _hover={{
                                transform: "translateY(-2px)",
                                boxShadow: "lg",
                            }}
                        >
                            Add Archer
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    )
}
