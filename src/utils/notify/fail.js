import { Notify } from 'quasar'

const fail = message => {
  return Notify.create({
    message,
    type: 'negative',
    position: 'top',
    timeout: 1000
  })
}

export default fail