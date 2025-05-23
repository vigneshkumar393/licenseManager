import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILicense extends Document {
  clientName: string;
  clientEmail: string;
  macAddress: string;
  licenseKey: string;
  validFrom?: Date;
  validTo?: Date;
}

const LicenseSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    macAddress: { type: String, required: true },
    licenseKey: { type: String, required: true },

    validFrom: { type: Date },
    validTo: { type: Date },
  },
  { timestamps: true }
);

const License: Model<ILicense> = mongoose.models.License || mongoose.model('License', LicenseSchema);

export default License;
