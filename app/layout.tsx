import { Metadata } from "next"
import ClientLayout from "./ClientLayout"
// コードブロックのCSS
import "highlight.js/styles/vs2015.css"
// グローバルCSS
import "../styles/css/global.css"

export const metadata: Metadata = {
    manifest: '/manifest.json'
}

/** 共通レイアウト部分 */
export default function RootLayout({ children, }: { children: React.ReactNode }) {
    // TODO Google Analytics
    // クライアントコンポーネントとして描画する必要があるため
    return (<ClientLayout children={children} />)
}
