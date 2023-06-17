"use client"

import { useTheme } from "@mui/material"
import Box from "@mui/material/Box"
import Head from "next/head"
// https://github.com/vercel/next.js/tree/canary/examples/svg-components 参照
import NotFoundIcon from "../public/not_found.svg"

/** 404ページ */
export default function ClientNotFoundPage() {
    const theme = useTheme()
    return (
        <>
            <Head>
                <title>404 - たくさんの自由帳</title>
            </Head>
            <Box textAlign='center'>
                {/* インラインSVG */}
                <NotFoundIcon
                    className={'theme_color'}
                    height={250}
                    width={250}
                />
                <h1>404 - 見つかりませんでした</h1>
                <p>そこになければ無いですね。</p>
                <p>URLを確認してみてください。</p>
            </Box>
            {/* CSSの属性セレクターを利用してSVG要素の中のpath、circleの色を変えている。 */}
            <style jsx global>{`
                .theme_color path {
                    stroke: ${theme.palette.primary.main};
                }
                .theme_color circle[style*="fill:none"] {
                    stroke: ${theme.palette.primary.main};
                }
                .theme_color circle[style*="stroke:none"] {
                    fill: ${theme.palette.primary.main};
                }
            `}</style>
        </>
    )
}