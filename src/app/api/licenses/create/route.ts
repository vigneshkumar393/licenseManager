// app/api/licenses/create/route.ts
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import License from '../../../../../models/License';

export async function POST(request: Request) {
  const body = await request.json();

  await connectDB();

  const now = new Date();
  const twoYearsLater = new Date(now);
  twoYearsLater.setFullYear(now.getFullYear() + 2);

  const licenseData = {
    ...body,
    validFrom: now,
    validTo: twoYearsLater,
  };

  const license = new License(licenseData);
  await license.save();

  return NextResponse.json({ licenseKey: license.licenseKey });
}
