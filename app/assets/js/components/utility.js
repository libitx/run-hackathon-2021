import api from '../util/api'
import Wallet from '../util/wallet'

const component = function() {
  return {
    async logout() {
      await api.delete('/auth')
      Wallet.destroy()
      window.liveSocket.redirect('/')
    }
  }
}

export default {
  component
}
