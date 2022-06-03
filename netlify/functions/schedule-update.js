const fetch = require('node-fetch')

exports.handler = async (event, context) => {
  try {
    console.log('')
    console.log('‹‹›⁄⁄⁄⁄⁄⁄⁄⁄›‹›‹‹‹‹‹››‹‹‹‹‹››››‹‹‹‹‹‹‹‹‹‹››‹›‹‹››››')
    console.log('')
    console.log('UPDATE SCHED :::::')
    let call = await fetch('https://squiggle-functions.netlify.app/.netlify/functions/update-squigs-background')
    console.log('CALLED UPDATE SQUIGS:', call)
    return { statusCode: 200, body: JSON.stringify({ call }) }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    }
  }
}
