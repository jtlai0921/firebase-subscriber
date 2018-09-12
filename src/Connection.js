import Promise from 'yaku/lib/yaku.core'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

export const DEFAULT_APP_NAME = 'default'

export default function (config, {
  getAuthToken,
  isAnonymous = false,
  needAuth = true
} = {}) {

  let app = getFirebaseApp()
  let authed = false
  let authorizing = false

  if (needAuth) {
    if (!isAnonymous && typeof getAuthToken !== 'function') {
      throw new TypeError('getAuthToken should be a function for non-anonymous auth')
    }
    if (isAnonymous && typeof getAuthToken === 'function') {
      throw new TypeError('getAuthToken should not be given for anonymous auth')
    }
  }

  return function getConnection() {
    if (!needAuth) {
      return Promise.resolve(getDb())
    }

    if (!shouldAuth()) {
      return Promise.resolve(getDb())
    }

    if (isAnonymous) {
      return authAnonymousConnection()
    } else {
      return authConnection()
    }

    return Promise.resolve(getDb())
  }

  function getFirebaseApp () {
    let name = config.appName || DEFAULT_APP_NAME
    try {
      return firebase.initializeApp(config, name)
    } catch (e) {
      return firebase.app(name)
    }
  }

  function shouldAuth () {
    if (authorizing) {
      return false
    }
    return !authed
  }

  function onLoginSuccess (user) {
    authorizing = false
    authed = true
    return getDb()
  }

  function getDb () {
    return app.database()
  }

  function authAnonymousConnection () {
    authorizing = true
    return firebase.auth(app)
      .signInAnonymously()
      .then(onLoginSuccess)
      .catch(err => {
        authorizing = false
        console.error('[FIREBASE signInAnonymously FAILED]', err)
      })
  }

  function authConnection () {
    authorizing = true
    return getAuthToken()
      .then(authToken => {
        return firebase.auth(app).signInWithCustomToken(authToken)
      })
      .then(onLoginSuccess)
      .catch(err => {
        authorizing = false
        console.error('[FIREBASE signInWithCustomToken FAILED]', err)
      })
  }
}
