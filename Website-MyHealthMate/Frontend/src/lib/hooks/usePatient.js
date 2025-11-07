import { useState } from 'react';
import { patientAPI } from '../api';

/**
 * Custom hook for Patient operations
 */
export function usePatient() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPatient = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientAPI.create(data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMyPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientAPI.getMyPatients();
      setPatients(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPatientById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientAPI.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientAPI.update(id, data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await patientAPI.delete(id);
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    patients,
    loading,
    error,
    createPatient,
    getMyPatients,
    getPatientById,
    updatePatient,
    deletePatient
  };
}
