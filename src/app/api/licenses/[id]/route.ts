import { NextRequest, NextResponse } from 'next/server';
import License from '../../../../../models/License';
import connectDB from '../../../../../lib/db';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    await connectDB();
    console.log("Deleting license with Id: " + id);

    const deleted = await License.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: 'License not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'License deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting license:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/licenses/[id] - Fetch license by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    await connectDB();
    console.log("Fetching license with Id:", id);

    const license = await License.findById(id);

    if (!license) {
      return NextResponse.json({ message: 'License not found' }, { status: 404 });
    }

    return NextResponse.json({ license }, { status: 200 });
  } catch (error) {
    console.error('Error fetching license:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/licenses/[id] - Update license by ID
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