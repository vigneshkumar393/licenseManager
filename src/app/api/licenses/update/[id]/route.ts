import { NextRequest, NextResponse } from 'next/server';
import License from '../../../../../../models/License';
import connectDB from '../../../../../../lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    await connectDB();
    const body = await request.json();

    const updatedLicense = await License.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedLicense) {
      return NextResponse.json({ message: 'License not found' }, { status: 404 });
    }

    return NextResponse.json({ license: updatedLicense }, { status: 200 });
  } catch (error) {
    console.error('Error updating license:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
