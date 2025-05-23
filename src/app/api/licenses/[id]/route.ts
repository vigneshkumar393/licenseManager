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
