import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    webpack(config) {
        // SVG をコンポーネントにできる
        config.module.rules.push({
            test: /\.svg$/,
            use: [
                {
                    loader: '@svgr/webpack',
                    options: {
                        svgoConfig: {
                            plugins: [
                                {
                                    name: 'preset-default',
                                    params: {
                                        overrides: {
                                            collapseGroups: false,
                                            cleanupIds: false
                                        },
                                    },
                                }
                            ]
                        }
                    }
                }
            ]
        })
        return config
    },
    // https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
    // turbopack 用 svgr 設定
    turbopack: {
        rules: {
            '*.svg': {
                loaders: [
                    {
                        loader: '@svgr/webpack',
                        options: {
                            svgoConfig: {
                                plugins: [
                                    {
                                        name: 'preset-default',
                                        params: {
                                            overrides: {
                                                collapseGroups: false,
                                                cleanupIds: false
                                            },
                                        },
                                    }
                                ]
                            }
                        }
                    }
                ],
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