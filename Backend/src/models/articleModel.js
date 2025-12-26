import { GET_DB } from '~/configs/mongodb'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'articles'

// Create New Article
const createNew = async (data) => {
  try {
    const newArticle = {
      ...data,
      createdAt: Date.now(),
      updateAt: null,
      _destroy: false
    }
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newArticle)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find All Articles (active only)
const findAll = async () => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({
        $or: [
          { _destroy: false },
          { _destroy: { $exists: false } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Find Article by ID
const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id), _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Update Article
const update = async (id, data) => {
  try {
    data.updateAt = Date.now()
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id), _destroy: false },
        { $set: data },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Delete Article (soft delete)
const deleteArticle = async (id) => {
  try {
    await GET_DB()
      .collection(COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true, updateAt: Date.now() } }
      )
  } catch (error) {
    throw new Error(error)
  }
}

const articleModel = {
  createNew,
  findAll,
  findOneById,
  update,
  deleteArticle
}

export default articleModel
