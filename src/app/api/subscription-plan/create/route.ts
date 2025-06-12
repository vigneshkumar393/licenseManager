import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(request: NextRequest) {
  try {
    await client.connect();
    const db = client.db('license_manager');
    const collection = db.collection('subscriptions');

    const body = await request.json();
    const { planName, SnHttpClient, SnScheduler, SnAlarm, SnHistory } = body;

    if (!planName || typeof planName !== 'string') {
      return NextResponse.json(
        { success: false, message: 'planName is required' },
        { status: 400 }
      );
    }

    if (
      [SnHttpClient, SnScheduler, SnAlarm, SnHistory].some(
        (v) => typeof v !== 'number' || v < 0
      )
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid input values' },
        { status: 400 }
      );
    }

    const result = await collection.insertOne({
      planName,
      SnHttpClient,
      SnScheduler,
      SnAlarm,
      SnHistory,
    });

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
      message: 'Plan created successfully',
    });
  } catch (error) {
    console.error('❌ Error creating subscription plan:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
