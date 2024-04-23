const { PHASE_DEVELOPMENT_SERVER } = require('next/dist/shared/lib/constants')

module.exports = async (phase, { defaultConfig }) => {

    /** @type {import('next').NextConfig} */
    const nextConfig = {
        output: 'export',
        trailingSlash: true,
        webpack(config) {
            // SVG をコンポーネントにできる
            config.module.rules.push({
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            })
            return config
        },
        experimental: {
            scrollRestoration: true,
        }
    }

    // このサイトは静的書き出しを使っていますが、静的書き出しモードでは使えない機能を開発中のみ使いたいため、
    // 開発時のみ静的書き出しモードを OFF にする。（ Next.js の revalidateTag ）
    // 開発時のみ OFF になるが、本番環境は静的書き出しを使うため、静的書き出しで使える機能のみを使う必要があります。
    // https://nextjs.org/docs/app/building-your-application/deploying/static-exports#supported-features
    if (phase === PHASE_DEVELOPMENT_SERVER) {
        nextConfig.output = undefined
    }

    return nextConfig
}