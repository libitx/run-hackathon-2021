import { Iodine } from '@kingshott/iodine'
import api from '../util/api'
import Wallet from '../util/wallet'

const iodine = new Iodine()
iodine.messages.regexMatch = 'Only letters, numbers or underscore'

const component = function() {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

  return {
    username: {
      blurred: false,
      error: '',
      rules: ['required', 'minimum:3', 'regexMatch:\\w+'],
      value: ''
    },
    password: {
      blurred: false,
      error: '',
      rules: ['required', 'minimum:12'],
      value: ''
    },

    blur(e) {
      const el = e.target
      this[el.name].blurred = true
      this.input(e)
    },

    input(e) {
      const el = e.target
      this[el.name].error = this.getError(this[el.name].value, this[el.name].rules)
    },

    getError(value, rules) {
      const isValid = iodine.is(value, rules)
      if (isValid !== true) {
        return iodine.getErrorMessage(isValid)
      }
      return ''
    },

    isValid() {
      ['username', 'password'].forEach(key => {
        this[key].blurred = true
        this[key].error = this.getError(this[key].value, this[key].rules)
      })
      return ['username', 'password'].every(key => {
        return this[key].blurred && !this[key].error
      })
    },

    async submit() {
      if (!this.isValid()) return false;
      const wallet = await Wallet.fromCredentials(this.username.value, this.password.value)
      const signature = wallet.sign(csrfToken)
      const params = {
        message: csrfToken,
        signature,
        username: this.username.value,
        xpub: wallet.master.toPublic().toString()
      }

      try {
        const r = await api.post('/auth', params)
        wallet.save()
        window.liveSocket.historyRedirect(window.location.href, 'push')
      } catch(e) {
        console.log(e)
      }
    }
  }
}


export default {
  component
}