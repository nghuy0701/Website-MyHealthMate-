/**
 * Seed Script: Assign Test Doctor to Existing Patients
 * Purpose: Create patient-doctor mappings so patients can chat
 * Run: npm run seed:assign-doctor
 */

import { GET_DB, CONNECT_DB } from './configs/mongodb.js'

const assignDoctorToPatients = async () => {
  try {
    console.log('🔌 Connecting to database...')
    await CONNECT_DB()
    console.log('✅ Database connected')

    const db = GET_DB()
    const usersCollection = db.collection('users')
    const mappingCollection = db.collection('patient_doctors')

    // Find test doctor
    const doctor = await usersCollection.findOne({ 
      email: 'doctor@test.com',
      role: 'doctor',
      _destroy: false
    })

    if (!doctor) {
      console.log('❌ Doctor not found! Run: npm run seed:doctor')
      process.exit(1)
    }

    console.log(`\n👨‍⚕️ Doctor: ${doctor.displayName}`)

    // Find all patients
    const patients = await usersCollection.find({
      role: { $in: ['member', 'patient'] },
      _destroy: false
    }).toArray()

    if (patients.length === 0) {
      console.log('⚠️  No patients found')
      process.exit(0)
    }

    console.log(`\n👥 Found ${patients.length} patient(s)`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    let assigned = 0, skipped = 0

    for (const patient of patients) {
      const exists = await mappingCollection.findOne({
        patientId: patient._id,
        _destroy: false
      })

      if (exists) {
        console.log(`⏭️  ${patient.displayName || patient.userName} (already assigned)`)
        skipped++
      } else {
        await mappingCollection.insertOne({
          patientId: patient._id,
          doctorId: doctor._id,
          createdAt: Date.now(),
          _destroy: false
        })
        console.log(`✅ ${patient.displayName || patient.userName} → ${doctor.displayName}`)
        assigned++
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n📊 Assigned: ${assigned} | Skipped: ${skipped}`)
    console.log('🎉 Done! Patients can now chat with doctor\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

assignDoctorToPatients()
