import subscriberCreator from 'src/subscriber';

describe('subscriberCreator(fbConfig, options)', function(){
  let getAuthToken;
  const fbConfig = {
    databaseURL: 'https://hacker-news.firebaseio.com'
  }

  beforeEach(function(){
    getAuthToken = sinon.stub();
  });
  let Connection, getConnection;
  beforeEach(function(){
    Connection = sinon.stub();
    getConnection = sinon.stub();
    Connection.returns(getConnection);

    subscriberCreator.__Rewire__('Connection', Connection);
  });
  afterEach(function(){
    subscriberCreator.__ResetDependency__('Connection');
  });

  it('returns a channel subscriber as a function', function(){
    let subscriber = subscriberCreator(fbConfig, { getAuthToken });

    expect(subscriber).to.be.an.instanceof(Function);
  });
  it('inject `fbConfig`, `getAuthToken` and `isAnonymous` to generate channel getter', function(){
    const isAnonymous = false
    let subscriber = subscriberCreator(fbConfig, { getAuthToken, isAnonymous });
    expect(Connection).to.have.been.calledWith(fbConfig, { getAuthToken, isAnonymous });
  });

  describe('Subscriber(path)', function(){
    let subscribe, authTokenDeferred;
    let ref;
    let authToken = 'auth-token',
        path = 'the-path';

    let Channel, conn, channel;
    beforeEach(function(){
      channel = {};
      Channel = sinon.stub();
      Channel.returns(channel);
      subscriberCreator.__Rewire__('Channel', Channel);
    });
    afterEach(function(){
      subscriberCreator.__ResetDependency__('Channel');
    });
    beforeEach(function(){
      ref = {};
      conn = {
        ref: sinon.stub()
      };
      conn.ref.returns(ref);
      getConnection.returns(Promise.resolve(conn));
      subscribe = subscriberCreator(fbConfig, { getAuthToken });
    });

    it('creates a channel with connection', function(done){
      let connection = conn;
      subscribe(path).then((ch) => {
        expect(conn.ref).to.have.been.calledWith(path);
        expect(Channel).to.have.been.calledWith({ ref })
        expect(ch).to.equal(channel);
        done()
      });
    });
  });
});
