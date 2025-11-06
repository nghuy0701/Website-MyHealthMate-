import { StatusCodes  } from 'http-status-codes'
import { patientService } from '~/services'
import ApiError from '~/utils/ApiError'

// Create New Patient
const createNew = async (req, res, next) => {
  try {
    const patient = await patientService.createNew(req)
    res.status(StatusCodes.CREATED).json({
      message: 'Patient created successfully',
      data: patient
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get Patient by ID
const getPatientById = async (req, res, next) => {
  try {
    const patientId = req.params.id
    const patient = await patientService.getById(patientId)
    res.status(StatusCodes.OK).json({
      message: 'Patient retrieved successfully',
      data: patient
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get My Patients (Doctor's patients)
const getMyPatients = async (req, res, next) => {
  try {
    const userId = req.session.user.userId
    const patients = await patientService.getByUserId(userId)
    res.status(StatusCodes.OK).json({
      message: 'Your patients retrieved successfully',
      data: patients
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get All Patients (Admin only)
const getAllPatients = async (req, res, next) => {
  try {
    const patients = await patientService.getAllPatients()
    res.status(StatusCodes.OK).json({
      message: 'All patients retrieved successfully',
      data: patients
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Update Patient
const updatePatient = async (req, res, next) => {
  try {
    const patientId = req.params.id
    const updatedPatient = await patientService.updatePatient(
      patientId,
      req.body
    )
    res.status(StatusCodes.OK).json({
      message: 'Patient updated successfully',
      data: updatedPatient
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Delete Patient
const deletePatient = async (req, res, next) => {
  try {
    const patientId = req.params.id
    await patientService.deletePatient(patientId)
    res.status(StatusCodes.OK).json({
      message: 'Patient deleted successfully'
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const patientController = {
  createNew,
  getPatientById,
  getMyPatients,
  getAllPatients,
  updatePatient,
  deletePatient
}
