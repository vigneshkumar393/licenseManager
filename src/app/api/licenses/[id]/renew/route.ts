import { NextRequest, NextResponse } from 'next/server';
import License from '../../../../../../models/License';
import connectDB from '../../../../../../lib/db';
import { generateCustomLicense } from '@/lib/license';
import Subscription from '../../../../../../models/subscription';
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

    const existingLicense = await License.findById(id);
    if (!existingLicense) {
      return NextResponse.json({ message: 'License not found' }, { status: 404 });
    }

        // Fetch subscription details by subscriptionId
    const subscription = await Subscription.findById(existingLicense.subscriptionId);
    if (!subscription) {
      return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
    }

    // Pass full subscription object to the license generator
    const newLicenseKey = generateCustomLicense(
      existingLicense.macAddress,
      new Date(validFrom),
      new Date(validTo),
      subscription.toObject()// 👈 pass full subscription object
    );
  
    const license = await License.findByIdAndUpdate(
      id,
      {
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        licenseKey:newLicenseKey
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
