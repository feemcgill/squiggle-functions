const fetch = require('node-fetch')

const { schedule } = require('@netlify/functions')

const handler = async function (event, context) {
  console.log('UPDATE SCHED')
  let call = await fetch('https://squiggle-functions.netlify.app/.netlify/functions/update-squigs-background')
  console.log('CALLED UPDATE SQUIGS:', call)

  return {
    statusCode: 200,
    body: JSON.stringify(call),
  }
}

module.exports.handler = schedule('@hourly', handler)
