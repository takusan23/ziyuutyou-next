// https://github.com/vercel/next.js/blob/canary/examples/progressive-web-app/next.config.js
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA({
    trailingSlash: true,
    pwa: {
        dest: 'public',
        // runtimeCaching: []
    },
});