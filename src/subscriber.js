import Connection from './Connection'
import Channel from './Channel'

const subscriber = function(config, { getAuthToken, isAnonymous = false }) {
  const getConnection = Connection(config, { getAuthToken, isAnonymous })

  return function subscribe(path) {
    let connection = getConnection()
    let ref = connection.ref(path)
    return new Channel({ ref })
  }
}

export default subscriber

