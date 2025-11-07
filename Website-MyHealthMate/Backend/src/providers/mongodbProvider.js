/**
 * MongoDB Provider - Database Operations Helper
 */

import { GET_DB } from '~/configs/mongodb'
import { ObjectId } from 'mongodb'

const findOne = async (collectionName, filter) => {
  try {
    const result = await GET_DB().collection(collectionName).findOne(filter)
    return result
  } catch (error) {
    throw new Error(`MongoDB findOne failed: ${error.message}`)
  }
}

const findMany = async (collectionName, filter = {}, options = {}) => {
  try {
    const result = await GET_DB()
      .collection(collectionName)
      .find(filter, options)
      .toArray()
    return result
  } catch (error) {
    throw new Error(`MongoDB findMany failed: ${error.message}`)
  }
}

const insertOne = async (collectionName, data) => {
  try {
    const result = await GET_DB().collection(collectionName).insertOne(data)
    return result
  } catch (error) {
    throw new Error(`MongoDB insertOne failed: ${error.message}`)
  }
}

const updateOne = async (collectionName, filter, update) => {
  try {
    const result = await GET_DB()
      .collection(collectionName)
      .updateOne(filter, update)
    return result
  } catch (error) {
    throw new Error(`MongoDB updateOne failed: ${error.message}`)
  }
}

const deleteOne = async (collectionName, filter) => {
  try {
    const result = await GET_DB().collection(collectionName).deleteOne(filter)
    return result
  } catch (error) {
    throw new Error(`MongoDB deleteOne failed: ${error.message}`)
  }
}

const aggregate = async (collectionName, pipeline) => {
  try {
    const result = await GET_DB()
      .collection(collectionName)
      .aggregate(pipeline)
      .toArray()
    return result
  } catch (error) {
    throw new Error(`MongoDB aggregate failed: ${error.message}`)
  }
}

const isValidObjectId = (id) => {
  return ObjectId.isValid(id)
}

const toObjectId = (id) => {
  return new ObjectId(id)
}

const mongodbProvider = {
  findOne,
  findMany,
  insertOne,
  updateOne,
  deleteOne,
  aggregate,
  isValidObjectId,
  toObjectId
}

export default mongodbProvider
