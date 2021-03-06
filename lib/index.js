var HashIds = require( 'hashids' )
var db = require( './db' )

function MysqlMeta( options ){
  this.options = options
  this.db = db( this.options )
  if( this.options.hasher ){
    this.hasher = this.options.hasher
  } else {
    this.hasher = new HashIds( this.options.secret || 'I AM PUNCHING YOUR SALAD' )
  }
}

MysqlMeta.prototype.sanitize = function( file ){
  if( Array.isArray( file ) ){
    return file.map( this.sanitize.bind( this ) )
  } else {
    file.id = this.makeId( file.id )
    return file
  }
}

MysqlMeta.prototype.makeId = function( numberId ){
  return this.hasher.encode( numberId )
}

MysqlMeta.prototype.parseId = function( hash ){
  var decoded = this.hasher.decode( hash )

  if( decoded.length ){
    return decoded[0]
  } else {
    return false
  }
}

MysqlMeta.prototype.get = function( id, callback ){
  id = this.parseId( id )

  if( id === false ){
    return callback( null, false )
  }

  this.db.find( id ).then( function( file ){
    callback( null, this.sanitize( file ) )
  }.bind( this ), callback )
}

MysqlMeta.prototype.all = function( callback ){
  this.db.findAll().then( function( files ){
    callback( null, this.sanitize( files ) )
  }.bind( this ), callback )
}

MysqlMeta.prototype.patch = function( id, values, callback ){
  id = this.parseId( id )

  this.db.patch( id, values ).then( function( file ){
    callback( null, this.sanitize( file ) )
  }.bind( this ), callback )
}

MysqlMeta.prototype.new = function( meta, callback ){
  this.db.create( meta ).then( function( file ){
    callback( null, this.sanitize( file ) )
  }.bind( this ), callback )
}

module.exports = MysqlMeta
