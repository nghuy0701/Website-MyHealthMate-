/**
 * Seed Entrypoint
 * Purpose: Run all initial seeds for production / dev
 */

import { CONNECT_DB } from '../configs/mongodb.js'
import './seedDoctorAccount.js'
import './seedAssignDoctor.js'

(async () => {
  try {
    console.log('🌱 Running global seed...')
    await CONNECT_DB()
    console.log('✅ DB connected')

    // chỉ import là chạy
    console.log('🎉 All seeds completed')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  }
})()
