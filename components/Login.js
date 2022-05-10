import { useUser, signOut } from "@auth0/nextjs-auth0"

export default function Login() {
    const { user, error, isLoading } = useUser()
    if (user) {
        return (
            <>
                <a href={"/api/auth/logout"}>Logout</a>
            </>
        )
    }
    return (
        <>
            Not signed in <br />
            <a href={"/api/auth/login"}>Login</a>
        </>
    )
}
