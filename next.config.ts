import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    experimental: {
        scrollRestoration: true
    },
    staticPageGenerationTimeout: 60 * 10 // 10分。Next.js 15 にしてから伸ばさないと怪しい
}

export default nextConfig