import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import License from '../../../../models/License';

export async function GET(request: Request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (page < 1 || limit < 1) {
    return NextResponse.json({ error: 'Invalid page or limit' }, { status: 400 });
  }

  const skip = (page - 1) * limit;

const [licenses, total] = await Promise.all([
  License.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('subscriptionId'), // Populate subscription document
  License.countDocuments(),
]);

  return NextResponse.json({
    licenses,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
