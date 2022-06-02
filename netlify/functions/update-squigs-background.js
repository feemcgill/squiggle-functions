const { request, gql } = require('graphql-request')
const fetch = require('node-fetch')
const algoliasearch = require('algoliasearch')
const algolia = algoliasearch(process.env.ALGOLIA_APP, process.env.ALGOLIA_KEY)
const algolia_index = algolia.initIndex(process.env.ALGOLIA_INDEX)

let current_time = new Date()

current_time_processed = current_time
  .setHours(current_time.getHours() - 2)
  .toString()
  .substr(0, 10)

let query_time = null
const last_found_id = 0

const write_to_algolia = async (objects) => {
  let returner = false
  if (objects.length > 0) {
    for (let i = 0; i < objects.length; i++) {
      const element = objects[i]
      element.objectID = element.tokenId
      element.updated = current_time
    }
    await algolia_index
      .partialUpdateObjects(objects, {
        createIfNotExists: true,
      })
      .then(({ objectIDs }) => {
        returner = objectIDs
      })
      .catch((error) => {
        returner = error
      })
  }
  return returner
}

const get_token_meta = async (input_array) => {
  let keepGoing = true
  let count = 0
  if (input_array.length > 0) {
    while (keepGoing) {
      let call = await fetch('https://token.artblocks.io/' + input_array[count].tokenId)
      let data = await call.json()
      input_array[count].features = data.features
      if (count === input_array.length - 1) {
        keepGoing = false
        return input_array
      } else {
        count++
      }
    }
  }
  return false
}

// const get_token_ownership = async () => {
//   const query = gql`
//   query DataQuery {
//     projects(where: { projectId: "0", contract_in: ["0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"] }) {
//       tokens(first: 100, where: { tokenId_gte: ${last_found_id}, updatedAt_gte: ${previous_hours} }, orderBy: tokenId) {
//         tokenId
//         owner {
//           id
//         }
//       }
//     }
//   }
// `
//   const ownership_array = []
//   let keepGoing = true
//   let count = 0
//   while (keepGoing) {
//     let call = await request('https://api.thegraph.com/subgraphs/name/artblocks/art-blocks', query)
//     let data = await call.json()
//     input_array[count].features = data.features
//     if (count === input_array.length - 1) {
//       keepGoing = false
//       return input_array
//     } else {
//       count++
//     }
//   }
// }

exports.handler = async (event, context) => {
  query_time = event.queryStringParameters.t || current_time_processed
  console.log('')
  console.log('············  REFERRING URL:  ············')
  console.log('')
  console.log(event.rawUrl)
  console.log('')
  console.log('··········································')
  console.log('')
  const query = gql`
  query DataQuery {
    projects(where: { projectId: "0", contract_in: ["0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"] }) {
      tokens(first: 100, where: { tokenId_gte: ${last_found_id}, updatedAt_gte: ${query_time} }, orderBy: tokenId) {
        tokenId
        owner {
          id
        }
      }
    }
  }
`

  try {
    console.log('')
    console.log('<==================== STARTING SEQUENCE ====================>')
    console.log('')

    // THE GRAPH
    const the_graph_response = await request('https://api.thegraph.com/subgraphs/name/artblocks/art-blocks', query)
    console.log('    •    OWNERSHP TRANSFERS & MINTS: ', the_graph_response.projects[0].tokens.length)

    // ARTBLOCKS
    const the_graph_tokens = the_graph_response.projects && the_graph_response.projects[0].tokens ? the_graph_response.projects[0].tokens : null
    const token_meta = await get_token_meta(the_graph_tokens)
    console.log('    •    METADATA from ARTBLOCKS: ', token_meta.length)

    // ALGOLIA
    const write_alolia = await write_to_algolia(token_meta)
    console.log('    •    UPDATE from ALGOIA: ', write_alolia)
    console.log('')
    console.log('<==================== STOPING  SEQUENCE ====================>')
    console.log('')

    return { statusCode: 200, body: JSON.stringify({ write_alolia }) }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    }
  }
}
