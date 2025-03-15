import { model, Schema } from 'mongoose';
import { Verification } from 'src/entities/auth.entity';

const VerificationSchema = new Schema<Verification>(
  {
    contact: String,
    token: {
      type: String,
      index: true,
    },
    expirationTime: Number,
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const VerificationModel = model<Verification>(
  'verification',
  VerificationSchema,
);
export { VerificationModel, VerificationSchema };
