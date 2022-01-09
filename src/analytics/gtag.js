/**
 * 参考
 * 
 * https://github.com/vercel/next.js/tree/master/examples/with-google-analytics
 */

/** Google アナリティクス の 測定ID */
export const GA_TRACKING_ID = `G-4RL6GT5JQX`

/**
 * ページ遷移のたびに呼ぶ
 * 
 * @param {string} url うらる
 */
export const pageview = (url) => {
    window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
    })
}
