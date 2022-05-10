import { ColorModeScript } from "@chakra-ui/react"
import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
    return (
        <Html>
            <Head>
                <meta name="title" content="Advanced Mafia" />
                <link rel="icon" href="/target.png" />
            </Head>
            <body>
                <ColorModeScript />

                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
