import React, { useEffect, useState } from "react"
import {
    IconButton,
    Avatar,
    Box,
    CloseButton,
    Flex,
    HStack,
    VStack,
    useColorModeValue,
    Drawer,
    DrawerContent,
    Text,
    useDisclosure,
    Menu,
    MenuButton,
    MenuList,
    Button,
    Image,
    Show,
    Badge,
} from "@chakra-ui/react"
import {
    FiHome,
    FiList,
    FiMenu,
    FiChevronDown,
} from "react-icons/fi"
import { GiArcheryTarget } from "react-icons/gi"
import {BsPersonFill} from "react-icons/bs"
import SidebarItem from "./SidebarItem"
import { useUser } from "@auth0/nextjs-auth0"
import { useRouter } from "next/router"
import UserNav from "./UserNav"
import AdminDev from "./AdminDev"

const LinkItems = [
    { name: "Home", icon: FiHome, linkTo: "#" },
    { name: "Players", icon: BsPersonFill, linkTo: "#" },
    { name: "Roles", icon: FiList, linkTo: "#" },
    { name: "Items", icon: FiList, linkTo: "#" },
]

export default function Layout({ children }) {
    const [accData, setAccData] = useState(null)

    const { query } = useRouter()

    useEffect(() => {
        fetch("/api/account")
            .then((res) => res.json())
            .then((data) => {
                setAccData(data)
            })
    }, [])

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { user } = useUser()

    return (
        //<Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
        <Box minH="100vh" bg={"white"}>
            {
                <>
                    {query.debug == "1"
                        ? JSON.stringify({ accData, user })
                        : null}
                    <SidebarContent
                        onClose={() => onClose}
                        display={{ base: "none", md: "block" }}
                    />

                    <Drawer
                        autoFocus={false}
                        isOpen={isOpen}
                        placement="left"
                        onClose={onClose}
                        returnFocusOnClose={false}
                        onOverlayClick={onClose}
                        size="full"
                    >
                        <DrawerContent>
                            <SidebarContent onClose={onClose} />
                        </DrawerContent>
                    </Drawer>
                    {/* mobilenav */}
                    <MobileNav
                        onOpen={onOpen}
                        user={user ?? {}}
                        account={accData?.account ?? {}}
                    />
                    <Box ml={{ base: 0, md: 60 }} p="4">
                        {children}
                    </Box>
                </>
            }
        </Box>
    )
}

const SidebarContent = ({ onClose, ...rest }) => {
    return (
        <Box
            transition="3s ease"
            bg={useColorModeValue("white", "gray.900")}
            borderRight="1px"
            borderRightColor={useColorModeValue("gray.200", "gray.700")}
            w={{ base: "full", md: 60 }}
            pos="fixed"
            h="full"
            {...rest}
        >
            <Flex
                h="20"
                alignItems="center"
                mx="8"
                justifyContent="space-between"
            >
                <Show breakpoint="(min-width: 768px)">
                    <Image alt={"Mafia Logo"} p={6} />
                </Show>

                <CloseButton
                    display={{ base: "flex", md: "none" }}
                    onClick={onClose}
                />
            </Flex>
            {LinkItems.map((link) => (
                <SidebarItem
                    key={link.name}
                    icon={link.icon}
                    linkTo={link.linkTo ?? "#"}
                >
                    {link.name}
                </SidebarItem>
            ))}
        </Box>
    )
}

const MobileNav = ({ account, onOpen, user, ...rest }) => {
    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue("white", "gray.900")}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue("gray.200", "gray.700")}
            justifyContent={{ base: "space-between", md: "flex-end" }}
            {...rest}
        >
            <IconButton
                display={{ base: "flex", md: "none" }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text
                display={{ base: "flex", md: "none" }}
                align={"center"}
                fontSize="xl"
                fontWeight="bold"
            >
                Advanced Mafia
            </Text>

            <HStack spacing={{ base: "0", md: "6" }}>
                <HStack spacing={{ base: "0", md: "1" }}>
                    <AdminDev account={account} />
                </HStack>

                <Flex alignItems={"center"}>
                    <Menu>
                        <MenuButton
                            py={2}
                            transition="all 0.3s"
                            _focus={{ boxShadow: "none" }}
                        >
                            <HStack>
                                <Avatar size={"sm"} src={user.picture} />
                                <VStack
                                    display={{ base: "none", md: "flex" }}
                                    alignItems="flex-start"
                                    spacing="1px"
                                    ml="2"
                                >
                                    <Text fontSize="sm">
                                        {user && user.name
                                            ? user.name
                                            : "Not signed in"}
                                    </Text>
                                    {account?.dev ? (
                                        <Badge colorScheme="purple">
                                            Wizard
                                        </Badge>
                                    ) : account?.admin ? (
                                        <Badge colorScheme="green">Coach</Badge>
                                    ) : (
                                        ""
                                    )}
                                </VStack>
                                <Box display={{ base: "none", md: "flex" }}>
                                    <FiChevronDown />
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList
                            bg={useColorModeValue("white", "gray.900")}
                            borderColor={useColorModeValue(
                                "gray.200",
                                "gray.700"
                            )}
                        >
                            <UserNav account={account} user={user} />
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    )
}
