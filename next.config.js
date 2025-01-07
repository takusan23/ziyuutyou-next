/** @type {import('next').NextConfig} */
module.exports = {
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
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
        }
    },
    staticPageGenerationTimeout: 60 * 10 // 10分
}