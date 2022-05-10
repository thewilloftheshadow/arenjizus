import { Flex, Icon, Link as ChakraLink } from "@chakra-ui/react"
import Link from "next/link"

import { useRouter } from "next/router"

export default function SidebarItem({ icon, linkTo, children, ...rest }) {
  const router = useRouter()

    return (
        <Link href={linkTo} passHref>
            <ChakraLink
                style={{ textDecoration: "none" }}
                _focus={{ boxShadow: "none" }}
            >
                <Flex
                    align="center"
                    p="4"
                    mx="4"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    _hover={{
                        bgGradient: "linear(to-r, blue.400, blue.500)",
                        color: "white",
                    }}
                    bgColor={router.pathname == linkTo ? "gray.100" : "white"}
                    {...rest}
                >
                    {icon && (
                        <Icon
                            mr="4"
                            fontSize="16"
                            _groupHover={{
                                color: "white",
                            }}
                            as={icon}
                        />
                    )}
                    {children}
                </Flex>
            </ChakraLink>
        </Link>
    )
}
