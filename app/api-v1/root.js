const winston           = require('winston')
const chalk             = require('chalk')
const passport          = require('passport')

var tokenCheck          = require('./middleware/TokenCheck')
var serverDescription   = require('../../config')

module.exports = function( app, express ) {
  var r = new express.Router()

  r.get( '/', ( req, res ) => {
    res.send( serverDescription.speckle )
  } )

  // STREAMS Pure
  // create a new stream
  r.post( '/streams', tokenCheck, require( './core/StreamCreate' ) )
  // create a new stream history (from live) into stream (broadcasts)
  r.post( '/streams/:streamId/history', tokenCheck, require( './core/StreamCreateHistory' ) )

  // get a specific stream.
  // get all streams for a specific user token
  r.get( '/streams', tokenCheck, require( './core/StreamGetAll' ) )
  // get one stream
  r.get( '/streams/:streamId', require( './core/StreamGet' ) )
  // get stream data. if no historyId is provided, we default to the live instance.
  r.get( '/streams/:streamId/data/:historyId?', require( './core/StreamGetData' ) )

  // UPDATES
  // update stream history instance; defaults to live if not provided (broadcasts)
  r.put( '/streams/:streamId/data/:historyId?', tokenCheck, require( './core/StreamLiveUpdate' ) )
  // update stream live instance metadata; defaults to live if not provided (broadcasts)
  r.put( '/streams/:streamId/meta/:historyId?', tokenCheck, require( './core/StreamLiveMetaUpdate' ) )

  // QUERYING
  r.get( '/streams/:streamId/data/objects/:format/:historyId?', require( './query/QueryStreamObjects' ) )

  // GEOMS
  // get the geometry of an object, full values
  r.get( '/geometry/:hash/:type?', require( './core/GeometryGet' ) )

  app.use( '/api/v1', r )

  // ACCOUNTS
  var a = new express.Router()

  // create a new account
  a.post( '/register', require('./accounts/UserCreate') )
  // returns a jwt token
  a.post( '/login', require('./accounts/UserLogin'))
  // update a user
  a.put( '/update', passport.authenticate( 'jwt', { session: false } ), require('./accounts/UserUpdate'))
  // get a user
  a.get( '/', passport.authenticate( 'jwt', { session: false } ), require( './accounts/UserGet'))

  app.use( '/api/v1/accounts', a )
}
