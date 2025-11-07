import { StatusCodes  } from 'http-status-codes'
import mlService from '~/services/mlService'
import ApiError from '~/utils/ApiError'

/**
 * Check ML Service Health
 */
const checkHealth = async (req, res, next) => {
  try {
    const health = await mlService.checkHealth()
    res.status(StatusCodes.OK).json({
      message: 'ML Service health check completed',
      data: health
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

/**
 * Get ML Service Info
 */
const getInfo = async (req, res, next) => {
  try {
    const info = await mlService.getInfo()
    res.status(StatusCodes.OK).json({
      message: 'ML Service info retrieved',
      data: info
    })
  } catch (error) {
    next(new ApiError(StatusCodes.SERVICE_UNAVAILABLE, error.message))
  }
}

/**
 * Test ML Prediction
 */
const testPredict = async (req, res, next) => {
  try {
    const result = await mlService.predictDiabetes(req.body)
    res.status(StatusCodes.OK).json({
      message: 'ML prediction test completed',
      data: result
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const mlController = {
  checkHealth,
  getInfo,
  testPredict
}
