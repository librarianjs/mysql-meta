var assert = require( 'assert' )
var MysqlMeta = require( '..' )
var makeDb = require( './make-db.js' )

var STEP_TIMEOUT = process.env.STEP_TIMEOUT || 3000

describe( 'librarian-mysql-meta', function(){
  var record = {
    fileName: 'cats.png',
    fileSize: 4444,
    mimeType: 'image/png'
  }

  var options = makeDb()

  var engine = new MysqlMeta({
    host: options.host,
    user: options.user,
    password: options.password,
    database: options.database,
    port: options.port,
    table: 'files'
  })

  var dbRecord = null
  it( 'should insert a new record', function( done ){
    this.timeout( STEP_TIMEOUT )

    engine.new( record, function( err, data ){
      try {
        if( err ) throw err

        assert( !!data, 'Data is falsey' )
        for( var key in record ){
          assert.equal( data[ key ], record[ key ], key + ' is different in saved record' )
        }

        dbRecord = data
      } catch ( err ){
        return done( err )
      }

      done()
    })
  })

  it( 'should retrieve that record', function( done ){
    this.timeout( STEP_TIMEOUT )

    engine.get( '' + dbRecord.id, function( err, data ){
      assert.ifError( err )
      assert( data !== null, 'Record is null' )
      assert( data !== false, 'Record pull failed' )
      for( var key in dbRecord ){
        if( key === 'id' ) continue
        assert.equal( data[ key ], record[ key ], key + ' is different in saved record' )
      }
      done()
    })
  })

  it( 'should return false for a non-existant record', function( done ){
    this.timeout( STEP_TIMEOUT )

    engine.get( 'fake', function( err, result ){
      assert.ifError( err )
      assert.equal( result, false )
      done()
    })
  })

  it( 'should allow fetching of all records', function( done ){
    this.timeout( STEP_TIMEOUT )

    engine.all( function( err, result ){
      try {
        if( err ) throw err
        assert.ifError( err )
        assert( Array.isArray( result ), 'Result set is not an array' )
      } catch ( err ){
        return done( err )
      }
      done()
    })
  })

  it( 'should allow patching the filename', function( done ){
    this.timeout( STEP_TIMEOUT )

    var newFilename = 'chipmunks.png'

    engine.patch( '' + dbRecord.id, {
      fileName: newFilename
    }, function( err, record ){
      try {
        assert.ifError( err )
        assert( record !== null, 'Record is null' )
        assert.equal( record.fileName, newFilename )
      } catch( e ){
        return done( e )
      }
      done()
    })
  })
})
