// app/api/licenses/create/route.ts
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import License from '../../../../../models/License';
import mongoose from 'mongoose'; // Import mongoose to use Types.ObjectId if needed for explicit casting

export async function POST(request: Request) {
  const body = await request.json();

  await connectDB();

  const validFrom = body.validFrom ? new Date(body.validFrom) : new Date();
  // Ensure validTo calculation handles potential type issues with validThru, defaulting to 2 years if not provided
  const validTo = body.validTo ? new Date(body.validTo) : (body.validThru ? new Date(body.validThru) : new Date(new Date().setFullYear(new Date().getFullYear())));

  // Extract subscriptionId specifically.
  // Ensure the field name coming from the frontend/client is 'subscriptionId'
  // If it's 'subscriptionPlanId' from the client, you must rename it here.
  const subscriptionId = body.subscriptionId; // Accept both for flexibility during transition

  const licenseData: any = { // Use 'any' for now to easily assign dynamic properties
    clientName: body.clientName,
    clientEmail: body.clientEmail,
    macAddress: body.macAddress,
    licenseKey: body.licenseKey,
    validFrom,
    validTo,
  }; 

  // Only add subscriptionId if it exists to avoid adding 'undefined'
  if (subscriptionId) {
    // Ensure the subscriptionId is a valid ObjectId, otherwise Mongoose might throw an error.
    // It's good practice to validate it here if it's coming from user input.
    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
        return NextResponse.json({ error: 'Invalid subscription ID format' }, { status: 400 });
    }
    licenseData.subscriptionId = new mongoose.Types.ObjectId(subscriptionId);
  }

  console.log("License data to be saved:", licenseData);

  try {
    const license = new License(licenseData);
    await license.save();

    return NextResponse.json({ licenseKey: license.licenseKey });
  } catch (error: any) {
    console.error("Error saving license:", error);
    return NextResponse.json({ error: 'Failed to create license', details: error.message }, { status: 500 });
  }
}
