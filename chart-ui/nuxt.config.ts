// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    baseURL: '/chart-data/',
      head: {
        link: [
          { rel: 'icon', type: 'image/vnd.microsoft.icon', href: 'images/logo-ics.ico' },
          { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon', href: 'images/logo-ics.ico' }
        ]
      },
    },
})
