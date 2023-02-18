// https://github.com/vercel/next.js/blob/canary/examples/progressive-web-app/next.config.js
const withPWA = require('next-pwa')({
    // https://github.com/GoogleChrome/workbox/issues/1790#issuecomment-729698643
    disable: process.env.NODE_ENV === 'development',
    dest: 'public',
})

module.exports = withPWA({
    trailingSlash: true,
    experimental: {
        scrollRestoration: true,
    },
});