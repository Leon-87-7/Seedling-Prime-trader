import 'dotenv/config';
import { connectToDatabase } from './mongoose';
import mongoose from 'mongoose';

(async () => {
  console.log('Testing MongoDB connection...\n');

  try {
    // Test environment variable
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    console.log('MONGODB_URI found in environment variables');

    // Attempt connection
    console.log('Connecting to MongoDB...');
    await connectToDatabase();

    // Verify connection state
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    console.log(`\n Connection Details:`);
    console.log(`   Status: ${states[state as keyof typeof states]}`);
    console.log(
      `   Database: ${mongoose.connection.db?.databaseName || 'N/A'}`
    );
    console.log(`   Host: ${mongoose.connection.host || 'N/A'}`);

    if (state === 1) {
      console.log('\nDatabase connection successful!');

      // Test a simple operation
      console.log('\n Testing database operations...');
      const collections = await mongoose.connection.db
        ?.listCollections()
        .toArray();
      console.log(
        `   Collections found: ${collections?.length || 0}`
      );
      if (collections && collections.length > 0) {
        console.log(
          `   Collection names: ${collections.map((c) => c.name).join(', ')}`
        );
      }

      // Disconnect
      await mongoose.disconnect();
      console.log('\n Disconnected from database');
      console.log('\n All tests passed!');
      process.exit(0);
    } else {
      throw new Error(
        `Connection state is "${states[state as keyof typeof states]}" instead of "connected"`
      );
    }
  } catch (error) {
    console.error('\n Database connection failed!');
    console.error('\nError details:');
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    } else {
      console.error(error);
    }
    console.error('\n Troubleshooting tips:');
    console.error(
      '   1. Check your .env file has MONGODB_URI defined'
    );
    console.error('   2. Verify your MongoDB URI is correct');
    console.error('   3. Check your network connection');
    console.error(
      '   4. Verify MongoDB Atlas IP whitelist (if using Atlas)'
    );
    process.exit(1);
  }
})();
