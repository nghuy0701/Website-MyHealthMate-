import express from 'express'
import * as controllers from '~/controllers'
import * as middlewares from '~/middlewares'

const router = express.Router()

// All patient routes require authentication and doctor role
router.use(middlewares.isAuthenticated)

// Create new patient (Doctor only)
router.post('/', middlewares.isDoctor, controllers.patientController.createNew)

// Get my patients (Doctor only)
router.get('/my-patients', middlewares.isDoctor, controllers.patientController.getMyPatients)

// Get all patients (Admin only)
router.get('/', middlewares.isAdmin, controllers.patientController.getAllPatients)

// Get patient by ID (Doctor or Admin)
router.get('/:id', middlewares.isDoctor, controllers.patientController.getPatientById)

// Update patient (Doctor or Admin)
router.put('/:id', middlewares.isDoctor, controllers.patientController.updatePatient)

// Delete patient (Doctor or Admin)
router.delete('/:id', middlewares.isDoctor, controllers.patientController.deletePatient)

export const patientRouter = router
