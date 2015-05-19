var mysql = require( 'mysql' )
var Promise = require( 'bluebird' )

function each( obj, callback ){
  for( var attr in obj ){
    if( obj.hasOwnProperty( attr ) ){
      callback( attr, obj[ attr ] )
    }
  }
}

var patchableFields = [ 'fileName', 'fileSize', 'mimeType' ]
function sanitizeInput( obj ){
  var attrs = {}
  for( var key in obj ){
    if( obj.hasOwnProperty( key ) ){
      attrs[ key ] = obj[ key ]
    }
  }
  return attrs
}

function toUpdateString( keys ){
  return keys.map( function( key ){
    return key + ' = ? '
  }).join( ', ' )
}

function createDBConnection( options ){
  options = options || {}

  var host = options.host || 'localhost'
  var port = options.port || 3306
  var databaseName = options.database || 'librarian'
  var user = options.user || 'librarian'
  var password = options.password

  var tableName = options.tableName || 'files'

  var connectionString = options.connectionString

  if( !connectionString && password === undefined ){
    throw new Error( 'librarian-mysql-meta password has not been provided' )
  }

  var connection
  if( connectionString ){
    connection = mysql.createConnection( connectionString )
  } else {
    connection = mysql.createConnection({
      host: host,
      port: port,
      user: user,
      password: password,
    })
  }

  function findOne( id ){
    var selectOneQueryString =
      'SELECT ' +
        'id, ' +
        'fileName, ' +
        'fileSize, ' +
        'mimeType ' +
      'FROM `' + databaseName + '`.`' + tableName + '` ' +
      'WHERE id = ?'

    return new Promise( function( resolve, reject ){
      connection.query( selectOneQueryString, [ id ], function( err, record ){
        if( err ){
          reject( err )
        } else {
          if( record.length ){
            resolve( record[0] )
          } else {
            resolve( false )
          }
        }
      })
    })
  }

  function findAll(){
    var selectAllQueryString =
      'SELECT ' +
        'id, ' +
        'fileName, ' +
        'fileSize, ' +
        'mimeType ' +
      'FROM `' + databaseName + '`.`' + tableName + '`'

    return new Promise( function( resolve, reject ){
      connection.query( selectAllQueryString, function( err, records ){
        if( err ){
          reject( err )
        } else {
          resolve( records )
        }
      })
    })
  }

  function patchOne( id, data ){
    data = sanitizeInput( data )

    var updateKeys = []
    var updateValues = []
    each( data, function( key, value ){
      updateKeys.push( key )
      updateValues.push( value )
    })

    var updateOneQueryString =
      'UPDATE `' + databaseName + '`.`' + tableName + '`\n' +
      'SET ' + toUpdateString( updateKeys ) + '\n' +
      'WHERE id = ?'
    updateValues.push( id )

    return new Promise( function( resolve, reject ){
      connection.query( updateOneQueryString, updateValues, function( err ) {
        if( err ){
          reject( err )
        } else {
          findOne( id ).then( function( doc ){
            resolve( doc )
          }, reject )
        }
      })
    })
  }

  function create( data ){
    data = sanitizeInput( data )

    var keys = []
    var values = []
    each( data, function( key, value ){
      keys.push( key )
      values.push( value )
    })

    var insertQueryString =
      'INSERT INTO ' + databaseName + '.' + tableName + '(' + keys.join( ', ' ) + ')\n' +
      'VALUES (' + values.map( function(){ return '?' }).join( ', ' ) + ')'

    return new Promise( function( resolve, reject ){
      connection.query( insertQueryString, values, function( err, info ){
        if( err ){
          reject( err )
        } else {
          findOne( info.insertId ).then( function( record ){
            resolve( record )
          }, reject )
        }
      })
    })
  }

  return {
    find: findOne,
    findAll: findAll,
    patch: patchOne,
    create: create
  }
}

module.exports = createDBConnection
