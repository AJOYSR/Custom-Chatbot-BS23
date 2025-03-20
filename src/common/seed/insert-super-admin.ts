import * as dotenv from 'dotenv';
dotenv.config();
import { Db, MongoClient, ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { dbConfig } from '../../config/database/index';

const client = new MongoClient(dbConfig.mongodb.URI);

export const up = async (db: Db): Promise<void> => {
  console.log('Starting super-admin seed process...');
  try {
    const superAdmin = {
      _id: new ObjectId(),
      firstName: 'Ajoy',
      lastName: 'Sarker',
      email: 'admin@bs23.com',
      password: await bcrypt.hash('admin23', 10),
      role: new ObjectId('65e5ba573d7272e56ee23123'),
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingSuperAdmin = await db
      .collection('users')
      .findOne({ email: superAdmin.email });

    if (!existingSuperAdmin) {
      await db.collection('users').insertOne(superAdmin);
      console.log('✅ Super admin created successfully!');
    } else {
      console.log('⚠️ Super admin already exists');
    }
  } catch (error) {
    console.error('Super admin seed failed:', error);
    throw error;
  }
};

export const down = async (db: Db): Promise<void> => {
  try {
    await db.collection('users').deleteOne({ email: 'admin@bs23.com' });
    console.log('✅ Super admin removed successfully!');
  } catch (error) {
    console.error('Down migration failed:', error);
    throw error;
  }
};

// Run the script when executed directly
if (require.main === module) {
  (async () => {
    try {
      await client.connect();
      console.log('Connected successfully to database!');

      const db = client.db('custom-chatbot');

      if (process.argv.includes('--down')) {
        await down(db);
      } else {
        await up(db);
      }

      await client.close();
    } catch (error) {
      console.error('Database operation failed:', error);
      process.exit(1);
    }
  })();
}
