import predictionModel from '~/models/predictionModel.js'
import { formatPrediction } from '~/utils/formatter'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import mlService from './mlService.js'
import emailService from './emailService.js'
import notificationService from './notificationService.js'


// Notification templates based on medical guidelines (ADA, WHO)
const NOTIFICATION_TEMPLATES = {
  prediction: {
    high: {
      title: '🔴 Kết quả dự đoán mới',
      getDescription: (prob) => `Kết quả dự đoán tiểu đường của bạn đã sẵn sàng. Mức độ nguy cơ: Cao (${Math.round(prob * 100)}%)`
    },
    medium: {
      title: '🟠 Kết quả dự đoán mới',
      getDescription: (prob) => `Kết quả dự đoán tiểu đường của bạn đã sẵn sàng. Mức độ nguy cơ: Trung bình (${Math.round(prob * 100)}%)`
    },
    low: {
      title: '🟢 Kết quả dự đoán mới',
      getDescription: (prob) => `Kết quả dự đoán tiểu đường của bạn đã sẵn sàng. Mức độ nguy cơ: Thấp (${Math.round(prob * 100)}%)`
    }
  },
  alert: {
    title: '⚠️ Cảnh báo nguy cơ cao',
    description: 'Kết quả dự đoán mới nhất cho thấy nguy cơ tiểu đường ở mức cao. Hãy tham khảo ý kiến bác sĩ.'
  },
  reminder: {
    medium: {
      title: '🔔 Nhắc nhở: Đã đến lúc kiểm tra sức khỏe',
      description: 'Bạn chưa thực hiện đánh giá nào trong 7 ngày qua. Hãy kiểm tra nguy cơ định kỳ.',
      daysAfter: 7
    },
    low: {
      title: '🔔 Nhắc nhở: Kiểm tra sức khỏe định kỳ',
      description: 'Đã 30 ngày kể từ lần kiểm tra cuối. Hãy duy trì theo dõi sức khỏe định kỳ.',
      daysAfter: 30
    }
  }
};

// Helper function to emit notification via Socket.IO
const emitNotification = (io, userId, notification) => {
  if (io) {
    io.to(userId).emit('notification:new', {
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        description: notification.description,
        isRead: notification.isRead,
        role: notification.role,
        deepLink: notification.deepLink,
        createdAt: notification.createdAt,
        meta: notification.meta
      }
    });
  }
};

// Create New Prediction
const createNew = async (req) => {
  try {
    const userId = req.session.user.userId

    // Get prediction from ML Service
    const mlResult = await mlService.predictDiabetes(req.body)

    // Tạo patient record nếu có thông tin bệnh nhân
    let patientId = req.body.patientId || null
    let patientEmail = req.body.patientEmail || null
    let patientName = req.body.patientName || null

    if (req.body.patientName && !patientId) {
      // Import patientModel để tạo bệnh nhân mới
      const patientModel = (await import('~/models/patientModel.js')).default

      const newPatient = {
        userId: userId,
        displayName: req.body.patientName,
        email: req.body.patientEmail || null,
        phone: null,
        address: null,
        dateOfBirth: null,
        gender: req.body.gender || null
      }

      const createdPatient = await patientModel.createNew(newPatient)
      patientId = createdPatient.insertedId.toString()
    }

    const newPrediction = {
      userId: userId,
      patientId: patientId,
      gender: req.body.gender || null,
      pregnancies: req.body.pregnancies,
      glucose: req.body.glucose,
      bloodPressure: req.body.bloodPressure,
      skinThickness: req.body.skinThickness,
      insulin: req.body.insulin,
      bmi: req.body.bmi,
      diabetesPedigreeFunction: req.body.diabetesPedigreeFunction,
      age: req.body.age,
      notes: req.body.notes || null,
      prediction: mlResult.prediction,
      probability: mlResult.probability,
      riskLevel: mlResult.riskLevel,
      modelUsed: mlResult.modelUsed,
      modelVersion: mlResult.modelVersion
    }

    const createdPrediction = await predictionModel.createNew(newPrediction)
    const getPrediction = await predictionModel.findOneById(
      createdPrediction.insertedId.toString()
    )

    if (!getPrediction) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to retrieve newly created prediction.'
      )
    }

    // Send prediction result email to patient (async, don't wait)
    if (patientEmail) {
      emailService.sendPredictionResultEmail(patientEmail, patientName, getPrediction)
        .catch(err => {
          // Silent fail - email is not critical
        })
    }

    // Smart Notification System - Create appropriate notifications based on risk level
    try {
      const riskLevel = getPrediction.riskLevel;
      const probability = getPrediction.probability;
      const io = req.app?.get('io');
      const predictionId = getPrediction._id.toString();

      // 1. ALWAYS create prediction result notification
      const predTemplate = NOTIFICATION_TEMPLATES.prediction[riskLevel];
      const predictionNotif = await notificationService.createNotification({
        userId: userId,
        type: 'prediction',
        title: predTemplate.title,
        description: predTemplate.getDescription(probability),
        role: 'patient',
        deepLink: {
          pathname: `/prediction/${predictionId}`,
          query: {}
        },
        meta: {
          predictionId: predictionId
        }
      });
      emitNotification(io, userId, predictionNotif);
      console.log(`[Prediction] Created prediction notification for user ${userId}`);

      // 2. If HIGH RISK (≥70%), create ALERT notification
      if (riskLevel === 'high') {
        const alertNotif = await notificationService.createNotification({
          userId: userId,
          type: 'alert',
          title: NOTIFICATION_TEMPLATES.alert.title,
          description: NOTIFICATION_TEMPLATES.alert.description,
          role: 'patient',
          deepLink: {
            pathname: `/prediction/${predictionId}`,
            query: {}
          },
          meta: {
            predictionId: predictionId
          }
        });
        emitNotification(io, userId, alertNotif);
        console.log(`[Prediction] Created ALERT notification for high risk user ${userId}`);
      }

      // 3. Schedule REMINDER notification (Medium: 7 days, Low: 30 days, High: NO reminder)
      if (riskLevel === 'medium' || riskLevel === 'low') {
        const reminderTemplate = NOTIFICATION_TEMPLATES.reminder[riskLevel];
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + reminderTemplate.daysAfter);

        const reminderNotif = await notificationService.createNotification({
          userId: userId,
          type: 'reminder',
          title: reminderTemplate.title,
          description: reminderTemplate.description,
          role: 'patient',
          deepLink: {
            pathname: '/prediction',
            query: {}
          },
          meta: {
            predictionId: predictionId
          }
        });

        // Note: For now, reminder is created immediately for testing
        // In production, implement a cron job to send reminders at scheduled time
        console.log(`[Prediction] Created REMINDER (scheduled for ${reminderTemplate.daysAfter} days: ${scheduledDate.toISOString()}) for user ${userId}`);
      }

    } catch (notifError) {
      console.error('[Prediction] Error creating notifications:', notifError);
      // Don't fail the prediction if notification fails
    }

    return formatPrediction(getPrediction)
  } catch (error) {
    throw error
  }
}

// Get Prediction by ID
const getById = async (predictionId) => {
  try {
    const prediction = await predictionModel.findOneById(predictionId)
    if (!prediction) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Prediction not found')
    }
    return formatPrediction(prediction)
  } catch (error) {
    throw error
  }
}

// Get Predictions by User ID
const getByUserId = async (userId) => {
  try {
    const predictions = await predictionModel.findByUserId(userId)
    return predictions.map(p => formatPrediction(p))
  } catch (error) {
    throw error
  }
}

// Get Predictions by Patient ID
const getByPatientId = async (patientId) => {
  try {
    const predictions = await predictionModel.findByPatientId(patientId)
    return predictions.map(p => formatPrediction(p))
  } catch (error) {
    throw error
  }
}

// Get All Predictions
const getAllPredictions = async () => {
  try {
    const predictions = await predictionModel.findAll()
    return predictions.map(p => formatPrediction(p))
  } catch (error) {
    throw error
  }
}

// Update Prediction
const updatePrediction = async (predictionId, data) => {
  try {
    const prediction = await predictionModel.findOneById(predictionId)
    if (!prediction) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Prediction not found')
    }

    const updatedPrediction = await predictionModel.update(predictionId, data)
    return formatPrediction(updatedPrediction)
  } catch (error) {
    throw error
  }
}

// Delete Prediction
const deletePrediction = async (predictionId) => {
  try {
    const prediction = await predictionModel.findOneById(predictionId)
    if (!prediction) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Prediction not found')
    }
    await predictionModel.deletePrediction(predictionId)
  } catch (error) {
    throw error
  }
}

// Get Statistics
const getStatistics = async (userId = null) => {
  try {
    const stats = await predictionModel.getStatistics(userId)
    return stats
  } catch (error) {
    throw error
  }
}

const predictionService = {
  createNew,
  getById,
  getByUserId,
  getByPatientId,
  getAllPredictions,
  updatePrediction,
  deletePrediction,
  getStatistics
}

export default predictionService
