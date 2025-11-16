import { GET_DB } from '~/configs/mongodb'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'questions'

// Create New Question
const createNew = async (data) => {
  try {
    const newQuestion = {
      ...data,
      createdAt: Date.now(),
      updateAt: null,
      _destroy: false
    }
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newQuestion)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find All Questions (active only)
const findAll = async () => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ _destroy: false })
      .sort({ order: 1 })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Find Question by ID
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

// Update Question
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

// Delete Question (soft delete)
const deleteQuestion = async (id) => {
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

const questionModel = {
  createNew,
  findAll,
  findOneById,
  update,
  deleteQuestion
}

export default questionModel
