import { useState } from 'react'
import { predictionAPI } from '../api'

/**
 * Custom hook for prediction operations
 * Following website-selling pattern
 */
export function usePrediction() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createPrediction = async (predictionData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await predictionAPI.create(predictionData)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getMyPredictions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await predictionAPI.getMyPredictions()
      setPredictions(response.data || [])
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getPredictionById = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await predictionAPI.getById(id)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deletePrediction = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await predictionAPI.delete(id)
      // Update local state
      setPredictions((prev) => prev.filter((p) => p._id !== id))
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getStatistics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await predictionAPI.getStatistics()
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    predictions,
    loading,
    error,
    createPrediction,
    getMyPredictions,
    getPredictionById,
    deletePrediction,
    getStatistics,
  }
}
