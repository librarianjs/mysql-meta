var MYSQL_PASSWORD = 'testpassword'
var MYSQL_DB = 'librarian_test'
var MYSQL_SCHEMA = require( 'fs' ).readFileSync( __dirname + '/schema.sql' )


var execSync = require( 'child_process' ).execSync
var sleep = require( 'sleep' ).sleep

function exec( command ){
  command = command
    .replace( '{name}', MYSQL_DB )
    .replace( '{mysql-password}', MYSQL_PASSWORD )
    .replace( '{schema}', MYSQL_SCHEMA )

  return execSync( command ).toString()
}

function startDb(){
  var running =  exec( 'docker inspect -f "{{.State.Running}}" {name} 2> /dev/null || :' ).trim()
  if( running !== 'true' ) {
    exec( 'docker run -d -P --name {name} -e MYSQL_ROOT_PASSWORD={mysql-password} mysql' )
    var command =
      'docker exec {name} ' +
      'mysqladmin ' +
        '-u root ' +
        '-p{mysql-password} ' +
      'status 2> /dev/null || :'
    while( true ){
      var output = exec( command )
      if( /Uptime/.test( output ) ){
        break
      }
      sleep( 1 )
    }
    var output = exec( 'echo "{schema}" | docker exec -i {name} mysql -u root -p{mysql-password}' )
  }

  var port = exec( 'docker port {name} | grep 3306/tcp' ).trim().split( '\n' ).pop().split( ':' ).pop()
  return {
    host: '127.0.0.1',
    port: port,
    user: 'root',
    password: MYSQL_PASSWORD,
    database: MYSQL_DB
  }
}
function stopDb(){
  return // don't do any cleanup right now, it makes the tests start much faster on the 2..nth run.
  exec( 'docker rm -f {name} 2> /dev/null || :' )
}

startDb.stop = stopDb

module.exports = startDb
