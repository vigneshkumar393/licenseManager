// models/license.ts
import mongoose, { Document, Model, Schema, Types } from 'mongoose'; // Import Types for ObjectId

export interface ILicense extends Document {
  clientName: string;
  clientEmail: string;
  macAddress: string;
  licenseKey: string;
  validFrom?: Date;
  validTo?: Date;
  subscriptionId?: Types.ObjectId; // Add subscriptionId field
}

const LicenseSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    macAddress: { type: String, required: true },
    licenseKey: { type: String, required: true },
    validFrom: { type: Date },
    validTo: { type: Date },
    // Reference to the Subscription model
      subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription"
    }
  },
{
  // Options for the schema
  timestamps: true,          
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false
}
);


LicenseSchema.virtual('Subscription', {
  ref: "Subscription",  // Correct model reference
  localField: 'subscriptionId', 
  foreignField: '_id',  
  justOne: true // Assuming one license links to one subscription
});


const License: Model<ILicense> = mongoose.models.License || mongoose.model('License', LicenseSchema);

export default License;