import { MenuItem, MenuDivider } from "@chakra-ui/react"
import Link from "next/link"

export default function UserNav({ account, user, ...rest }) {
    return (
        <>
            <Link href="#" passHref>
                <MenuItem
                    _hover={{
                        bgGradient: "linear(to-r, blue.400, blue.500)",
                    }}
                >
                    Profile
                </MenuItem>
            </Link>
            <Link href="#" passHref>
                <MenuItem
                    _hover={{
                        bgGradient: "linear(to-r, blue.400, blue.500)",
                    }}
                >
                    Settings
                </MenuItem>
            </Link>
            {account?.admin ? (
                <Link href="#" passHref>
                    <MenuItem
                        _hover={{
                            bgGradient: "linear(to-r, blue.400, blue.500)",
                        }}
                    >
                        Admin
                    </MenuItem>
                </Link>
            ) : null}
            <MenuDivider />
            {user && user.name ? (
                <Link href="/api/auth/logout" passHref>
                    <MenuItem
                        _hover={{
                            bgGradient: "linear(to-r, blue.400, blue.500)",
                        }}
                    >
                        Logout
                    </MenuItem>
                </Link>
            ) : (
                <Link href="/api/auth/login" passHref>
                    <MenuItem
                        _hover={{
                            bgGradient: "linear(to-r, blue.400, blue.500)",
                        }}
                    >
                        Login
                    </MenuItem>
                </Link>
            )}
        </>
    )
}
