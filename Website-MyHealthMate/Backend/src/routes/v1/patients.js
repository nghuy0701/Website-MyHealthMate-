import express from 'express'
import { patientController } from '~/controllers'
import { patientValidation } from '~/validations'
import { isAuthenticated, isAdmin } from '~/middlewares'

const Router = express.Router()

// All patient routes require authentication
Router.use(isAuthenticated)

// Create new patient
Router.route('/')
  .post(patientValidation.createNew, patientController.createNew)
  .get(isAdmin, patientController.getAllPatients)

// Get my patients
Router.route('/my-patients')
  .get(patientController.getMyPatients)

// Patient operations by ID
Router.route('/:id')
  .get(patientController.getPatientById)
  .put(patientValidation.update, patientController.updatePatient)
  .delete(patientController.deletePatient)

export const patientRoute = Router
