const { GET_DB } = require('../configs/mongodb');
const Joi = require('joi');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'patients';

// Validation Schema for Patient
const PATIENT_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(), // Doctor who manages this patient
  fullName: Joi.string().required().min(3).max(100),
  email: Joi.string().email().optional().allow(null),
  phone: Joi.string().optional().allow(null),
  gender: Joi.string().valid('male', 'female', 'other').optional().allow(null),
  dob: Joi.date().optional().allow(null),
  address: Joi.string().optional().allow(null),
  medicalHistory: Joi.string().optional().allow(null),
  notes: Joi.string().optional().allow(null),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

// Invalid Update Fields
const INVALID_UPDATE_FIELDS = ['_id', 'userId', 'createdAt'];

// Create New Patient
const createNew = async (data) => {
  try {
    const validData = await PATIENT_COLLECTION_SCHEMA.validateAsync(data, {
      abortEarly: false
    });
    const createdPatient = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(validData);
    return createdPatient;
  } catch (error) {
    throw new Error(error);
  }
};

// Find Patient by ID
const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id), _destroy: false });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Find All Patients by User ID (Doctor's patients)
const findByUserId = async (userId) => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ userId: userId, _destroy: false })
      .sort({ createdAt: -1 })
      .toArray();
    return results;
  } catch (error) {
    throw new Error(error);
  }
};

// Find Patient by Email
const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ email: email, _destroy: false });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Get All Patients
const findAll = async () => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ _destroy: false })
      .sort({ createdAt: -1 })
      .toArray();
    return results;
  } catch (error) {
    throw new Error(error);
  }
};

// Update Patient
const update = async (id, data) => {
  try {
    // Remove invalid fields
    Object.keys(data).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete data[key];
      }
    });

    data.updatedAt = Date.now();

    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id), _destroy: false },
        { $set: data },
        { returnDocument: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Delete Patient (Soft Delete)
const deletePatient = async (id) => {
  try {
    await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } }
      );
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createNew,
  findOneById,
  findByUserId,
  findOneByEmail,
  findAll,
  update,
  deletePatient
};
