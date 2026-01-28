/**
 * Seed Script: Create Test Doctor Account
 * 
 * Purpose: Create a test doctor account for demo/testing chat functionality
 * Run: npm run seed:doctor
 */

import { GET_DB } from '../configs/mongodb.js'
import { CONNECT_DB } from '../configs/mongodb.js'
import bcrypt from 'bcryptjs'

const TEST_DOCTOR = {
  email: 'doctor@test.com',
  userName: 'doctor_demo',
  password: 'Doctor123', // Will be hashed - Must be 8+ chars
  displayName: 'BS. Demo',
  phone: '0901234567',
  gender: 'male',
  dob: '1985-01-01',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DoctorDemo',
  role: 'doctor',
  specialty: 'Nội tiết',
  bio: 'Bác sĩ chuyên khoa Nội tiết - Đái tháo đường. 10+ năm kinh nghiệm.',
  verified: true,
  createdAt: Date.now(),
  updateAt: null,
  _destroy: false
}

const seedDoctorAccount = async () => {
  try {
    // Connect to database
    console.log('🔌 Connecting to database...')
    await CONNECT_DB()
    console.log('✅ Database connected')

    const db = GET_DB()
    const usersCollection = db.collection('users')

    // Check if doctor already exists
    const existingDoctor = await usersCollection.findOne({ 
      email: TEST_DOCTOR.email 
    })

    if (existingDoctor) {
      console.log('⚠️  Doctor account already exists!')
      console.log('📧 Email:', existingDoctor.email)
      console.log('👤 Name:', existingDoctor.displayName)
      console.log('🆔 ID:', existingDoctor._id)
      console.log('\n💡 Use these credentials to login:')
      console.log('   Email:', TEST_DOCTOR.email)
      console.log('   Password:', TEST_DOCTOR.password)
      process.exit(0)
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(TEST_DOCTOR.password, 8)

    // Create doctor account
    console.log('👨‍⚕️ Creating test doctor account...')
    const result = await usersCollection.insertOne({
      ...TEST_DOCTOR,
      password: hashedPassword
    })

    console.log('\n✅ Doctor account created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 ACCOUNT DETAILS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🆔 ID:', result.insertedId)
    console.log('📧 Email:', TEST_DOCTOR.email)
    console.log('🔑 Password:', TEST_DOCTOR.password)
    console.log('👤 Name:', TEST_DOCTOR.displayName)
    console.log('💼 Role:', TEST_DOCTOR.role)
    console.log('🏥 Specialty:', TEST_DOCTOR.specialty)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🚀 You can now login with:')
    console.log('   Email: doctor@test.com')
    console.log('   Password: Doctor123')
    console.log('\n📍 Login URL: http://localhost:3000/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating doctor account:', error)
    process.exit(1)
  }
}

// Run seed
seedDoctorAccount()
