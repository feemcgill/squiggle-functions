// Only in Node.js
const fs = require('fs')
const algoliasearch = require('algoliasearch')

const client = algoliasearch('7UPM7DEV72', '9313348ea743c01f7c8d2db40722cb59')
const index = client.initIndex('Squigs')

let hits = []

index
  .browseObjects({
    batch: (objects) => (hits = hits.concat(objects)),
  })
  .then(() => {
    console.log('Finished! We got %d hits', hits.length)
    fs.writeFile('browse.json', JSON.stringify(hits, null, 2), 'utf-8', (err) => {
      if (err) throw err
      console.log('Your index was successfully exported!')
    })
  })
