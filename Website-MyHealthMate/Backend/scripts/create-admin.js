/**
 * Script to create an Admin account directly in MongoDB
 * Usage: node scripts/create-admin.js
 */

import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current file directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from root directory (3 levels up: scripts -> Backend -> Website-MyHealthMate -> root)
const envPath = path.resolve(__dirname, '../../../.env')
dotenv.config({ path: envPath })

const MONGODB_URI = process.env.MONGODB_URI
const DATABASE_NAME = process.env.DATABASE_NAME

const adminData = {
  email: 'admin@myhealthmate.com',
  password: 'Admin@123456', // Will be hashed
  userName: 'admin_master',
  displayName: 'System Administrator',
  phone: '0123456789',
  role: 'admin'
}

async function createAdmin() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('🔄 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db(DATABASE_NAME)
    const adminsCollection = db.collection('admins')

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({
      $or: [
        { email: adminData.email },
        { userName: adminData.userName }
      ]
    })

    if (existingAdmin) {
      console.log('⚠️  Admin already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('UserName:', existingAdmin.userName)
      return
    }

    // Hash password
    console.log('🔄 Hashing password...')
    const hashedPassword = bcrypt.hashSync(adminData.password, 10)

    // Create admin document
    const newAdmin = {
      _id: new ObjectId(),
      email: adminData.email,
      password: hashedPassword,
      userName: adminData.userName,
      displayName: adminData.displayName,
      phone: adminData.phone,
      role: adminData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      _destroy: false
    }

    // Insert into database
    console.log('🔄 Creating admin account...')
    const result = await adminsCollection.insertOne(newAdmin)

    console.log('✅ Admin account created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', adminData.email)
    console.log('👤 UserName:', adminData.userName)
    console.log('🔑 Password:', adminData.password)
    console.log('🆔 ID:', result.insertedId.toString())
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  Please save these credentials!')

  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await client.close()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run the script
createAdmin()
