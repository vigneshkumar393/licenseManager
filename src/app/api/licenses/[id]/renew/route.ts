import { NextRequest, NextResponse } from 'next/server';
import License from '../../../../../../models/License';
import connectDB from '../../../../../../lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    await connectDB();
    console.log("Id: "+id)

    const body = await request.json();
    const { validFrom, validTo } = body;

    if (!validFrom || !validTo) {
      return NextResponse.json({ message: 'validFrom and validTo are required' }, { status: 400 });
    }

    const license = await License.findByIdAndUpdate(
      id,
      {
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
      },
      { new: true }
    );

    if (!license) {
      return NextResponse.json({ message: 'License not found' }, { status: 404 });
    }

    return NextResponse.json(license);
  } catch (error) {
    console.error('Error renewing license:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
