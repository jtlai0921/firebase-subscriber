import Connection from './Connection'
import Channel from './Channel'

const subscriber = (config = {}, options) => {
  const getConnection = Connection(config, options)

  return function subscribe(path) {
    return getConnection().then((connection) => {
      return new Channel({
        ref: connection.ref(path)
      })
    }).catch(console.error)
  }
}

export default subscriber

