import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json'
  },
  withCredentials: true
})

const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
api.defaults.headers.post['x-csrf-token'] = csrfToken
api.defaults.headers.delete['x-csrf-token'] = csrfToken

export default api