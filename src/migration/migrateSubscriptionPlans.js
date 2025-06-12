// migrateSubscriptionPlans.js
const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId

const SUBSCRIPTION_PLANS = {
  free: {
    SnHttpClient: 500,
    SnScheduler: 100,
    SnAlarm: 200,
    SnHistory: 600,
  },
  basic: {
    SnHttpClient: 1000,
    SnScheduler: 300,
    SnAlarm: 500,
    SnHistory: 1200,
  },
  standard: {
    SnHttpClient: 3000,
    SnScheduler: 700,
    SnAlarm: 1000,
    SnHistory: 3000,
  },
  premium: {
    SnHttpClient: 10000,
    SnScheduler: 2000,
    SnAlarm: 5000,
    SnHistory: 10000,
  },
  enterprise: {
    SnHttpClient: 100000,
    SnScheduler: 5000,
    SnAlarm: 10000,
    SnHistory: 200000,
  },
};

// Define the predefined _id values for each plan
const PREDEFINED_IDS = {
  free: '6847ba6e05fcfb4baba9f8e3', // User-provided example
  basic: '6847ba6e05fcfb4baba9f8e4',
  standard: '6847ba6e05fcfb4baba9f8e5',
  premium: '6847ba6e05fcfb4baba9f8e6',
  enterprise: '6847ba6e05fcfb4baba9f8e7',
};

async function migrate() {
  const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('license_manager'); // Replace with your DB name
    const collection = db.collection('subscriptions');

    // Optional: Clear existing plans before inserting.
    // This is crucial if you want to ensure the new IDs are used without conflicts.
    await collection.deleteMany({});
    console.log('🧹 Cleared old subscription plans.');

    // Map the SUBSCRIPTION_PLANS to include the predefined _id
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([planName, limits]) => ({
      _id: new ObjectId(PREDEFINED_IDS[planName]), // Create ObjectId from predefined string
      planName,
      ...limits,
      createdAt: new Date(),
    }));

    const result = await collection.insertMany(plans);
    console.log(`✅ Inserted ${result.insertedCount} subscription plans.`);
  } catch (err) {
    // Handle duplicate key errors if you don't deleteMany() and _id already exists
    if (err.code === 11000) {
      console.error('❌ Migration failed: Duplicate _id found. Ensure no existing documents have these IDs, or clear the collection first.');
    } else {
      console.error('❌ Migration failed:', err);
    }
  } finally {
    await client.close();
  }
}

migrate();