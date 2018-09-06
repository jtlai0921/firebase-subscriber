import Connection from './Connection'
import Channel from './Channel'

export const defaultOptions = {
  getAuthToken: null,
  needAuth: true,
  isAnonymous: false
}

const subscriber = (config = {}, options = defaultOptions) => {
  const getConnection = Connection(config, options)

  return function subscribe(path) {
    let connection = getConnection()
    let ref = connection.ref(path)
    return new Channel({ ref })
  }
}

export default subscriber

