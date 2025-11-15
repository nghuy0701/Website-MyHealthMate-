import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

let diabetesDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Connect to MongoDB
export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()
  diabetesDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// Get Database Instance
export const GET_DB = () => {
  if (!diabetesDatabaseInstance) {
    throw new Error('Must connect to MongoDB first')
  }
  return diabetesDatabaseInstance
}
