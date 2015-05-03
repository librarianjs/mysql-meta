# Librarian Mongo Meta

## Installation
```
$ npm install librarian-mysql-meta
```

## Usage
```js
var express = require( 'express' )
var librarian = require( 'librarian' )
var MysqlMeta = require( 'librarian-mysql-meta' )
var meta = new MysqlMeta({
  host: '192.168.0.44:27017', // optional, defaults to 'localhost:27017'
  secret: 'shhhhhh!', // optional, defaults to 'pumpkins are friends, not food'
  collectionName: 'myUploads' // optional, defaults to 'libarian_upload'
})

var app = express()
app.use( '/files', librarian({
    metadataEngine: meta
}) )

app.listen( 8888, function(){
    console.log( 'app listening' )
})
```

## Note

Although this module relies on `hashids` to give a pseudo-random image id,
this is **not meant to be cryptographically secure**.
