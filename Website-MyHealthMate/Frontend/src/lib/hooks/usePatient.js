import { useState } from 'react'
import { patientAPI } from '../api'

/**
 * Custom hook for patient operations (for doctors)
 * Following website-selling pattern
 */
export function usePatient() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createPatient = async (patientData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await patientAPI.create(patientData)
      setPatients((prev) => [...prev, response.data])
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getMyPatients = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await patientAPI.getMyPatients()
      setPatients(response.data || [])
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getPatientById = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await patientAPI.getById(id)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePatient = async (id, patientData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await patientAPI.update(id, patientData)
      // Update local state
      setPatients((prev) =>
        prev.map((p) => (p._id === id ? response.data : p))
      )
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deletePatient = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await patientAPI.delete(id)
      // Update local state
      setPatients((prev) => prev.filter((p) => p._id !== id))
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    patients,
    loading,
    error,
    createPatient,
    getMyPatients,
    getPatientById,
    updatePatient,
    deletePatient,
  }
}
