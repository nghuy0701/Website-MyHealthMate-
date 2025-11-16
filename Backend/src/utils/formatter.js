// Pick specific fields from user object
const pickUser = (user) => {
  if (!user) return null
  
  return {
    _id: user._id,
    email: user.email,
    userName: user.userName,
    displayName: user.displayName,
    name: user.name || user.displayName || user.userName,
    role: user.role,
    phone: user.phone || null,
    gender: user.gender || null,
    age: user.age || null,
    dob: user.dob || null,
    avatar: user.avatar || null,
    avatarPublicId: user.avatarPublicId || null,
    createdAt: user.createdAt
  }
}

// Format prediction data
const formatPrediction = (prediction) => {
  if (!prediction) return null
  
  return {
    _id: prediction._id,
    userId: prediction.userId,
    patientId: prediction.patientId,
    pregnancies: prediction.pregnancies,
    glucose: prediction.glucose,
    bloodPressure: prediction.bloodPressure,
    skinThickness: prediction.skinThickness,
    insulin: prediction.insulin,
    bmi: prediction.bmi,
    diabetesPedigreeFunction: prediction.diabetesPedigreeFunction,
    age: prediction.age,
    prediction: prediction.prediction,
    probability: prediction.probability,
    riskLevel: prediction.riskLevel,
    modelUsed: prediction.modelUsed,
    modelVersion: prediction.modelVersion,
    createdAt: prediction.createdAt,
    updatedAt: prediction.updatedAt
  }
}

// Format patient data
const formatPatient = (patient) => {
  if (!patient) return null
  
  return {
    _id: patient._id,
    userId: patient.userId,
    fullName: patient.fullName,
    email: patient.email,
    phone: patient.phone,
    gender: patient.gender,
    dob: patient.dob,
    address: patient.address,
    medicalHistory: patient.medicalHistory,
    notes: patient.notes,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt
  }
}

export { pickUser,
  formatPrediction,
  formatPatient
 }
