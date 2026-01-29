import { GET_DB } from './configs/mongodb.js'

/**
 * Migration script to add status field to existing messages
 * Run this once to update all existing messages
 */
async function migrateMessageStatus() {
    try {
        console.log('[Migration] Starting message status migration...')

        const db = GET_DB()
        const result = await db.collection('messages').updateMany(
            { status: { $exists: false } }, // Find messages without status field
            { $set: { status: 'sent' } } // Set default status to 'sent'
        )

        console.log(`[Migration] Updated ${result.modifiedCount} messages with status field`)
        console.log('[Migration] Migration completed successfully!')

        process.exit(0)
    } catch (error) {
        console.error('[Migration] Error:', error)
        process.exit(1)
    }
}

// Run migration
migrateMessageStatus()
