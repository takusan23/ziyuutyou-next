import { useRouter } from "next/router"
import { useEffect } from "react"
import * as gtag from "../analytics/gtag"

/** Google Analytics へnext/routerのページ遷移の状態を通知する */
const useGoogleAnalytics = () => {
    // Google アナリティクスへページ遷移を通知
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = (url: string) => {
            gtag.pageview(url)
        }
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [router.events])
}

export default useGoogleAnalytics