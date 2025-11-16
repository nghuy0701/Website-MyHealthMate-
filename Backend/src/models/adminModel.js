import { GET_DB  } from '~/configs/mongodb'
import { ObjectId  } from 'mongodb'

const COLLECTION_NAME = 'admin'

const ADMIN_ROLES = {
  ADMIN: 'admin'
}

// Invalid Update Fields
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'adminName', 'createdAt']

// Create New Admin
const createNew = async (data) => {
  try {
    const newAdmin = {
      ...data,
      role: data.role || ADMIN_ROLES.ADMIN,
      createdAt: Date.now(),
      updateAt: null,
      _destroy: false
    }
    const createdAdmin = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newAdmin)
    return createdAdmin
  } catch (error) {
    throw new Error(error)
  }
}

// Find Admin by Email
const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ email: email, _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find Admin by AdminName
const findOneByAdminName = async (adminName) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ adminName: adminName, _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find Admin by ID
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

// Find Admin by Verification Token
const findOneByVerificationToken = async (token) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ 
        verificationToken: token, 
        _destroy: false 
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Update Admin
const update = async (id, data) => {
  try {
    // Remove invalid fields
    Object.keys(data).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete data[key]
      }
    })

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

// Delete Admin (Soft Delete)
const deleteAdmin = async (id) => {
  try {
    await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } }
      )
  } catch (error) {
    throw new Error(error)
  }
}

// Get All Admins
const findAll = async () => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ _destroy: false })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

const adminModel = {
  ADMIN_ROLES,
  createNew,
  findOneByEmail,
  findOneByAdminName,
  findOneById,
  findOneByVerificationToken,
  update,
  deleteAdmin,
  findAll
}

export default adminModel
