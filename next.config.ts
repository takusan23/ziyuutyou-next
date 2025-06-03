import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            }
        }
    },
    experimental: {
        scrollRestoration: true
    },
    staticPageGenerationTimeout: 60 * 10 // 10分。Next.js 15 にしてから伸ばさないと怪しい
}

export default nextConfig