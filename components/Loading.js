import { Spinner } from "@chakra-ui/react"
import styles from "../styles/Loading.module.css"

export default function Loading() {
    return (
        <main className={styles.loading}>
            <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
            />
        </main>
    )
}
