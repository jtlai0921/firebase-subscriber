import Connection from './Connection'
import Channel from './Channel'

const subscriber = (config = {}, options) => {
  const getConnection = Connection(config, options)

  return function subscribe(path) {
    let connection = getConnection()
    let ref = connection.ref(path)
    return new Channel({ ref })
  }
}

export default subscriber

