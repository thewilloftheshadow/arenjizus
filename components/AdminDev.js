import {
    Box,
    Menu,
    MenuButton,
    Tooltip,
    MenuList,
    MenuItem,
    MenuDivider,
    Button,
} from "@chakra-ui/react"
import Link from "next/link"

import { FiShield } from "react-icons/fi"
import { FaHatWizard } from "react-icons/fa"
import { GiWhistle } from "react-icons/gi"

export default function AdminDev({ account }) {
    return (
        <>
            {account?.dev ? (
                <Box>
                    <Menu>
                        <Tooltip
                            hasArrow
                            label="Secret Wizard Magic"
                            bg="blue.500"
                            color="white"
                        >
                            <MenuButton
                                as={Button}
                                variant={"ghost"}
                                color={"black"}
                            >
                                <FaHatWizard />
                            </MenuButton>
                        </Tooltip>

                        <MenuList>
                            <MenuItem>
                                <Link href="https://vercel.com/thewilloftheshadow/advanced-mafia">
                                    See Deployment
                                </Link>
                            </MenuItem>
                            <MenuItem>
                                <Link href="https://cloud.prisma.io/thewilloftheshadow/advanced-mafia/production/databrowser">
                                    Database Editor
                                </Link>
                            </MenuItem>
                            <MenuItem>
                                <Link href="https://manage.auth0.com/dashboard/us/shadowdev/users">
                                    User Manager
                                </Link>
                            </MenuItem>
                            <MenuItem>
                                <Link href="/api/account">Account Info</Link>
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
            ) : null}
            {account?.admin ? (
                <Box>
                    <Menu>
                        <Tooltip
                            hasArrow
                            label="Coaches"
                            bg="blue.500"
                            color="white"
                        >
                            <MenuButton
                                as={Button}
                                variant={"ghost"}
                                color={"black"}
                            >
                                <GiWhistle />
                            </MenuButton>
                        </Tooltip>

                        <MenuList>
                            <MenuItem>
                                <Link href="/admin/events">Edit Events</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link href="/admin/events">Record Scores</Link>
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem>
                                <Link href="/api/account">Dev Account</Link>
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
            ) : null}
        </>
    )
}
