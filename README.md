# Librarian MySQL Meta

## Installation
```
$ npm install librarian-mysql-meta
```

## Usage
```js
var express = require( 'express' )
var librarian = require( 'librarian' )
var MysqlMeta = require( 'librarian-mysql-meta' )
var HashIds = require( 'hashids' )
var meta = new MysqlMeta({

  // Connection option 1, pass details in a hash
  host: '192.168.0.44', // optional, defaults to 'localhost'
  port: 3306, // optional, defaults to 3306
  database: 'awesome_project', // optional, defaults to 'librarian'
  user: 'archive_reader', // optional, defaults to 'librarian'
  password: process.env.LIBRARIAN_DB_ACCESS_PASSWORD, // REQUIRED

  // Connection option 2, pass a connectionString
  // If you use this method, all information in option 1 will be ignored
  connectionString: 'mysql://user:password@host/db',

  table: 'librarian_uploads', // optional, defaults to 'files'
  secret: 'whisper whisper' // optional, defaults to 'I AM PUNCHING YOUR SALAD',

  // You can provide a custom HashIds object if your needs are more specific
  // Be aware that this will cause the secret option to be ignored
  hasher: new HashIds( 'the dog is over there', 7, '0123456789abcdef' )
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

Although this module relies on [HashIds](http://hashids.org/) to give a pseudo-random image id,
this is **not intended for security**, this is only used because `/files/adffDc` is better looking than `/files/2`.
