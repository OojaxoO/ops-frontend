module.exports = {
  // mode: 'universal',
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: '运维平台',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    // 'iview/dist/styles/iview.css'
    'view-design/dist/styles/iview.css',
    'codemirror/lib/codemirror.css',
    // merge css
    'codemirror/addon/merge/merge.css',
    // theme css
    'codemirror/theme/base16-dark.css',
    '~/css/main.css',
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/iview',
    '@/plugins/codemirror',
    '~/plugins/axios',
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  //  '@nuxtjs/dotenv' 
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],

  auth: {
    plugins: [  { src: '~/plugins/axios', ssr: false }, '~/plugins/auth.js', '~/plugins/api.js'],
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '/login',
            method: 'post',
            propertyName: 'data.token',
          },
          logout: false,
          user: { 
            url: '/api/user/info', 
            method: 'get',
            propertyName: 'data',
          }
        },
        //tokenRequired: false,
        //tokenType: false,

      }
    },
    redirect: {
      logout: '/login',
      login: '/login',
      home: '/',
    },
    rewriteRedirects: true,
  },

  axios: {
    baseURL: 'http://192.168.1.131:10000', 
    // proxyHeaders: false
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    transpile: ['@nuxtjs/auth'],
    extend (config, ctx) {
    }
  },
  router: {
    middleware: ['auth'],
    mode: 'history',
    // scrollBehavior(to, from, savedPosition) {
    //   return { x: 0, y: 0 }
    // }
  },
  dev: (process.env.NODE_ENV !== 'production')
}
