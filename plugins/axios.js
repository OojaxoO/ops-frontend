import { Message } from 'view-design'

export default function ({ $axios, redirect }) {
    $axios.onRequest(config => {
      console.log('Making request to ' + config.url)
    })

    $axios.onResponse(response => {
      if (response.data.code != 200) {
          Message.error(response.data.msg)
      }
      return response
    })
  
    $axios.onError(error => {
      console.log(error)
      const code = parseInt(error.response && error.response.status)
      if (error.response && error.response.data && error.response.data.msg) {
          Message.error(error.response.data.msg)
      }
      // if (code === 400) {
      //   redirect('/400')
      // }
    })
}