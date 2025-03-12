// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr:false,
  modules: [
    '@vueuse/nuxt',
  ],
  app: {
    baseURL: '/chart-data/',
      head: {
        meta:[
{charset: "utf-8"}
        ],
        link: [
          { rel: 'icon', type: 'image/vnd.microsoft.icon', href: 'images/logo-ics.ico' },
          { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon', href: 'images/logo-ics.ico' }
        ]
      },
    },
})
