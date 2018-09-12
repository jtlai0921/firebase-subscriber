/* eslint-disable no-unused-expressions */
import Channel from 'src/Channel'

describe('Firebase::Channel', function () {
  let connection
  let channel, ref

  beforeEach(function () {
    connection = {
      child: sinon.stub()
    }

    ref = {
      on: sinon.stub(),
      once: sinon.stub(),
      remove: sinon.stub()
    }
    connection.child.returns(ref)
    channel = new Channel({ ref })
  })

  function getDataSnapshot (data, key) {
    return {
      val () { return data },
      key
    }
  }

  describe('Setter Methods Delegation', function () {
    function ensureDelegateToRef (methodName) {
      describe(`#${methodName}(value)`, function () {
        beforeEach(function () {
          ref[methodName] = sinon.stub()
        })
        it(`delegate method \`${methodName}\` to ref`, function () {
          let channel = new Channel({ ref })
          channel[methodName]('the-val')
          expect(ref[methodName]).to.have.been.calledWith('the-val')
        })
      })
    }
    ensureDelegateToRef('set')
    ensureDelegateToRef('update')
    ensureDelegateToRef('push')
    ensureDelegateToRef('remove')
  })

  describe('#onDisconnect(callback)', function () {
    let disconnectRef
    beforeEach(function () {
      disconnectRef = {}
      ref.onDisconnect = sinon.stub()
      ref.onDisconnect.returns(disconnectRef)
    })
    it('invokes callback with disconnect ref', function () {
      let channel = new Channel({ ref })
      let disconnectCb = sinon.stub()
      channel.onDisconnect(disconnectCb)

      expect(disconnectCb).to.have.been.calledWith(disconnectRef)
    })
  })

  describe('Event Handling', function () {
    describe('#once(eventName, callback, options)', function () {
      beforeEach(function () {
        channel = new Channel({ ref })
      })
      it('registers event and callback on ref', function () {
        let onValue = sinon.spy()

        channel.once('value', onValue)

        expect(ref.once).to.have.been.calledWith('value', sinon.match.func)
      })
      it('invokes callback with `val` & `key`', function () {
        let onValue = sinon.spy()
        let callback
        let data = { key: 'val' }
        let key = 'the-key'
        let dataSnapshot = getDataSnapshot(data, key)
        ref.once = function (evName, cb) {
          callback = cb
        }

        channel.once('value', onValue)
        callback(dataSnapshot)

        expect(onValue).to.have.been.calledWith(data, key)
      })
      it('calls `options` key as method, value as params', () => {
        let onValue = sinon.spy()
        let callback
        let dataSnapshot = getDataSnapshot('val1')
        let options = {
          limitToLast: 3,
          orderByChild: 'created_at'
        }
        ref.limitToLast = () => ref
        ref.orderByChild = () => ref
        ref.once = (evName, cb) => {
          callback = cb
        }

        sinon.spy(ref, 'limitToLast')
        sinon.spy(ref, 'orderByChild')

        channel.once('value', onValue, options)
        callback(dataSnapshot)

        expect(ref.limitToLast).to.have.been.calledWith(options.limitToLast)
        expect(ref.orderByChild).to.have.been.calledWith(options.orderByChild)
      })

      it('ignore the first one if `ignoreFirst` is passed', function () {
        let onValue = sinon.spy()
        let callback
        let dataSnapshot1 = getDataSnapshot('val1')
        let dataSnapshot2 = getDataSnapshot('val2')
        ref.once = function (evName, cb) {
          callback = cb
        }

        channel.once('value', onValue, { ignoreFirst: true })
        callback(dataSnapshot1)
        callback(dataSnapshot2)

        expect(onValue).to.have.been.calledOnce
        expect(onValue).to.have.been.calledWith('val2')
      })
    })

    describe('#on(eventName, callback, options)', function () {
      beforeEach(function () {
        channel = new Channel({ ref })
      })
      it('registers event and callback on ref', function () {
        let onChildAdded = sinon.spy()

        channel.on('child_added', onChildAdded)

        expect(ref.on).to.have.been.calledWith('child_added', sinon.match.func)
      })
      it('invokes callback with `val`ed first params', function () {
        let onChildAdded = sinon.spy()
        let callback
        let data = { key: 'val' }
        let key = 'the-key'
        let dataSnapshot = getDataSnapshot(data, key)
        ref.on = function (evName, cb) {
          callback = cb
        }

        channel.on('child_added', onChildAdded)
        callback(dataSnapshot)

        expect(onChildAdded).to.have.been.calledWith(data, key)
      })
      it('ignore the first one if `ignoreFirst` is passed', function () {
        let onChildAdded = sinon.spy()
        let callback
        let dataSnapshot1 = getDataSnapshot('val1')
        let dataSnapshot2 = getDataSnapshot('val2')
        ref.on = function (evName, cb) {
          callback = cb
        }

        channel.on('child_added', onChildAdded, { ignoreFirst: true })
        callback(dataSnapshot1)
        callback(dataSnapshot2)

        expect(onChildAdded).to.have.been.calledOnce
        expect(onChildAdded).to.have.been.calledWith('val2')
      })
      it('calls `options` key as method, value as params', () => {
        let onChildAdded = sinon.spy()
        let callback
        let dataSnapshot = getDataSnapshot('val1')
        let options = {
          limitToLast: 3,
          orderByChild: 'created_at'
        }
        ref.limitToLast = () => ref
        ref.orderByChild = () => ref
        ref.on = (evName, cb) => {
          callback = cb
        }

        sinon.spy(ref, 'limitToLast')
        sinon.spy(ref, 'orderByChild')

        channel.on('child_added', onChildAdded, options)
        callback(dataSnapshot, 'hi')

        expect(ref.limitToLast).to.have.been.calledWith(options.limitToLast)
        expect(ref.orderByChild).to.have.been.calledWith(options.orderByChild)
      })
    })
  })

  describe('#off()', function () {
    function createHandle () {
      return function () {}
    }
    let handle1 = createHandle()

    let handle2 = createHandle()

    let handle3 = createHandle()
    beforeEach(function () {
      ref.on.onCall(0).returns(handle1)
      ref.on.onCall(1).returns(handle2)
      ref.on.onCall(2).returns(handle3)
      ref.off = sinon.spy()
    })

    it('offs all the registered events', function () {
      let channel = new Channel({ ref })
      let cb = sinon.spy()
      channel.on('event1', cb)
      channel.on('event2', cb)
      channel.on('event3', cb)

      channel.off()

      expect(ref.off).to.have.been.calledWith('event1', handle1)
      expect(ref.off).to.have.been.calledWith('event2', handle2)
      expect(ref.off).to.have.been.calledWith('event3', handle3)
    })
  })

  describe('#remove()', () => {
    it('removes the current ref', () => {
      let channel = new Channel({ ref })
      channel.remove()
      expect(ref.remove).to.have.been.called
    })
  })
})
