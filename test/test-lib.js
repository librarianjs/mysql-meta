var assert = require( 'assert' )
var MysqlMeta = require( '..' )

describe( 'librarian-mysql-meta', function(){
  var record = {
    fileName: 'cats.png',
    fileSize: 4444,
    mimeType: 'image/png'
  }

  var engine = new MysqlMeta({
    host: 'localhost:27017',
    databaseName: 'mocha',
    tableName: 'librarianTests'
  })

  var dbRecord = null
  it( 'should insert a new record', function( done ){
    engine.new( record, function( err, data ){
      assert.ifError( err )
      assert( !!data, 'Data is falsey' )
      for( var key in record ){
        assert.equal( data[ key ], record[ key ], key + ' is different in saved record' )
      }

      dbRecord = data
      done()
    })
  })

  it( 'should retrieve that record', function( done ){
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
    engine.get( 'fake', function( err, result ){
      assert.ifError( err )
      assert.equal( result, false )
      done()
    })
  })

  it( 'should allow fetching of all records', function( done ){
    engine.all( function( err, result ){
      assert.ifError( err )
      assert( Array.isArray( result ), 'Result set is not an array' )
      done()
    })
  })

  it( 'should allow patching the filename', function( done ){
    var newFilename = 'chipmunks.png'

    engine.patch( '' + dbRecord.id, {
      fileName: newFilename
    }, function( err, record ){
      assert.ifError( err )
      assert( record !== null, 'Record is null' )
      assert.equal( record.fileName, newFilename )
      done()
    })
  })
})
