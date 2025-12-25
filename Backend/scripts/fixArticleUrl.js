const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function fixArticleUrl() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔄 Connecting to MongoDB...');
    
    const db = client.db();
    const result = await db.collection('articles').updateOne(
      { title: 'Stress và tiểu đường: Mối liên hệ bạn cần biết' },
      { 
        $set: { 
          imageUrl: 'https://images.unsplash.com/photo-1758691462123-8a17ae95d203?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwYXRpZW50JTIwbWVkaWNhbHxlbnwxfHx8fDE3NjEzOTA3ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        } 
      }
    );
    
    console.log('✅ Fixed article #6 imageUrl typo');
    console.log('Modified count:', result.modifiedCount);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixArticleUrl();
