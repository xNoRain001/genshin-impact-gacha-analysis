import { Notify } from 'quasar'

const suc = message => {
  return Notify.create({
    message,
    type: 'positive',
    position: 'top',
    timeout: 1000
  })
}

export default suc