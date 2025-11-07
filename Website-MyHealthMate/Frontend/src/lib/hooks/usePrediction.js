import { useState } from 'react';
import { predictionAPI } from '../api';

/**
 * Custom hook for Prediction operations
 */
export function usePrediction() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPrediction = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await predictionAPI.create(data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMyPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await predictionAPI.getMyPredictions();
      setPredictions(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPredictionById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await predictionAPI.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await predictionAPI.getStatistics();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePrediction = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await predictionAPI.delete(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    predictions,
    loading,
    error,
    createPrediction,
    getMyPredictions,
    getPredictionById,
    getStatistics,
    deletePrediction
  };
}
