// app/api/subscription-plan/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid plan ID' },
      { status: 400 }
    );
  }

  try {
    await client.connect();
    const db = client.db('license_manager');
    const collection = db.collection('subscriptions');

    const body = await request.json();
    const { SnHttpClient, SnScheduler, SnAlarm, SnHistory } = body;

    // Optional: Validate input
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

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          SnHttpClient,
          SnScheduler,
          SnAlarm,
          SnHistory,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: true, message: 'No changes made' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Plan updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating subscription plan:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
