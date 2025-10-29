const { patientModel } = require('../models');
const { formatPatient } = require('../utils/formatter');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

// Create New Patient
const createNew = async (req) => {
  try {
    const userId = req.session.user.userId;

    // Check if patient with email already exists
    if (req.body.email) {
      const existPatient = await patientModel.findOneByEmail(req.body.email);
      if (existPatient) {
        throw new ApiError(StatusCodes.CONFLICT, 'Patient with this email already exists!');
      }
    }

    const newPatient = {
      userId: userId,
      fullName: req.body.fullName,
      email: req.body.email || null,
      phone: req.body.phone || null,
      gender: req.body.gender || null,
      dob: req.body.dob || null,
      address: req.body.address || null,
      medicalHistory: req.body.medicalHistory || null,
      notes: req.body.notes || null
    };

    const createdPatient = await patientModel.createNew(newPatient);
    const getPatient = await patientModel.findOneById(
      createdPatient.insertedId.toString()
    );

    if (!getPatient) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to retrieve newly created patient.'
      );
    }

    return formatPatient(getPatient);
  } catch (error) {
    throw error;
  }
};

// Get Patient by ID
const getById = async (patientId) => {
  try {
    const patient = await patientModel.findOneById(patientId);
    if (!patient) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
    }
    return formatPatient(patient);
  } catch (error) {
    throw error;
  }
};

// Get Patients by User ID (Doctor's patients)
const getByUserId = async (userId) => {
  try {
    const patients = await patientModel.findByUserId(userId);
    return patients.map(p => formatPatient(p));
  } catch (error) {
    throw error;
  }
};

// Get All Patients
const getAllPatients = async () => {
  try {
    const patients = await patientModel.findAll();
    return patients.map(p => formatPatient(p));
  } catch (error) {
    throw error;
  }
};

// Update Patient
const updatePatient = async (patientId, data) => {
  try {
    const patient = await patientModel.findOneById(patientId);
    if (!patient) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
    }

    const updatedPatient = await patientModel.update(patientId, data);
    return formatPatient(updatedPatient);
  } catch (error) {
    throw error;
  }
};

// Delete Patient
const deletePatient = async (patientId) => {
  try {
    const patient = await patientModel.findOneById(patientId);
    if (!patient) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
    }
    await patientModel.deletePatient(patientId);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createNew,
  getById,
  getByUserId,
  getAllPatients,
  updatePatient,
  deletePatient
};
