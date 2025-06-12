import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import { MongoClient } from 'mongodb';
import Subscription from '../../../../models/subscription';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (page < 1 || limit < 1) {
      return NextResponse.json({ success: false, error: 'Invalid page or limit' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      Subscription.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
      Subscription.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      data: plans,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
