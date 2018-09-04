import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

export const EXPIRING_BUFFER = 60 * 60

/*
 * @param {object} config - the firebase config
 * @param {function} [options.getAuthToken] - a promise resolving authToken
 * @param {boolean} [options.isAnonymous] - a flag to determine if auth anonymously
 */
const Connection = function (config, {
  getAuthToken,
  isAnonymous,
  needAuth
}) {
  let app
  let authed = false
  let authorizing = false
  let expiresAt = 0

  if (needAuth) {
    if (!isAnonymous && typeof getAuthToken !== 'function') {
      throw new TypeError('getAuthToken should be a function for non-anonymous auth')
    }
    if (isAnonymous && typeof getAuthToken === 'function') {
      throw new TypeError('getAuthToken should not be given for anonymous auth')
    }
  }

  return function getConnection() {
    if (!app) {
      app = firebase.initializeApp(config)
    }

    if (!needAuth) {
      return app.database()
    }

    if (!shouldAuth()) {
      return app.database()
    }

    firebase.auth(app).onAuthStateChanged((user) => {
      if (user) {
        onLoginSuccess(user)
      } else {
        // on sign out
      }
    })

    if (isAnonymous) {
      authAnonymousConnection()
    } else {
      authConnection()
    }

    return app.database()
  }

  function shouldAuth () {
    if (authorizing) {
      return false
    }
    return !authed || aboutToExpired(expiresAt)
  }

  function onLoginSuccess (user) {
    authorizing = false
    console.log('[FIREBASE auth SUCCESS]', user)
    // expiresAt = authData.expires
    authed = true
  }

  function authAnonymousConnection () {
    authorizing = true
    firebase.auth(app).signInAnonymously().catch(err => {
      authorizing = false
      console.error('[FIREBASE signInAnonymously FAILED]', err)
    })
  }

  function authConnection () {
    authorizing = true
    getAuthToken().then(authToken => {
      return firebase.auth(app).signInWithCustomToken(authToken)
    })
    .catch(err => {
      authorizing = false
      console.error('[FIREBASE signInWithCustomToken FAILED]', err)
    })
  }
}

function aboutToExpired (expiresAt) {
  const now = parseInt(new Date().getTime() / 1000)
  return expiresAt - now < EXPIRING_BUFFER
}

export default Connection
