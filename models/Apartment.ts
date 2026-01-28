import mongoose, { Schema, Document, Model } from 'mongoose';

export interface BedroomBed {
  type: 'queen' | 'single' | 'sofa_bed_1' | 'sofa_bed_2';
}

export interface IApartment extends Document {
  name: string;
  address: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  owner: mongoose.Types.ObjectId;
  description?: string;
  maxCapacity?: number;
  // New specifications
  bathrooms?: number;
  salon?: {
    hasSofaBed: boolean;
    sofaBedCapacity: 1 | 2; // 1 or 2 persons
  };
  bedrooms?: Array<{
    beds: BedroomBed[];
  }>;
  // Calculated max capacity based on beds (auto-calculated)
  calculatedMaxCapacity?: number;
  cleaningTime?: number; // Cleaning time in minutes (e.g., 210 for 3 hours 30 minutes)
  /** How to enter: description + photos. Admin-only edit; operators/owners can view. */
  howToEnterDescription?: string;
  howToEnterPhotos?: Array<{
    url: string;
    description?: string;
    uploadedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ApartmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
    },
    maxCapacity: {
      type: Number,
      min: 1,
    },
    bathrooms: {
      type: Number,
      min: 0,
    },
    salon: {
      hasSofaBed: {
        type: Boolean,
        default: false,
      },
      sofaBedCapacity: {
        type: Number,
        enum: [1, 2],
        default: 1,
      },
    },
    bedrooms: [{
      beds: [{
        type: {
          type: String,
          enum: ['queen', 'single', 'sofa_bed_1', 'sofa_bed_2'],
          required: true,
        },
      }],
    }],
    calculatedMaxCapacity: {
      type: Number,
      min: 0,
    },
    cleaningTime: {
      type: Number,
      min: 0,
      default: null,
    },
    howToEnterDescription: { type: String },
    howToEnterPhotos: [{
      url: { type: String, required: true },
      description: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

// Calculate max capacity based on beds before saving
ApartmentSchema.pre('save', function(next) {
  const salon = this.salon as any;
  const hasSalonSofaBed = salon && typeof salon === 'object' && salon.hasSofaBed === true;
  
  if (this.bedrooms || hasSalonSofaBed) {
    let totalCapacity = 0;
    
    // Count capacity from bedrooms
    if (this.bedrooms && Array.isArray(this.bedrooms)) {
      this.bedrooms.forEach((bedroom: any) => {
        if (bedroom.beds && Array.isArray(bedroom.beds)) {
          bedroom.beds.forEach((bed: any) => {
            switch (bed.type) {
              case 'queen':
                totalCapacity += 2; // Queen bed sleeps 2
                break;
              case 'single':
                totalCapacity += 1; // Single bed sleeps 1
                break;
              case 'sofa_bed_1':
                totalCapacity += 1; // Sofa bed for 1 person
                break;
              case 'sofa_bed_2':
                totalCapacity += 2; // Sofa bed for 2 persons
                break;
            }
          });
        }
      });
    }
    
    // Add salon sofa bed capacity if exists
    if (hasSalonSofaBed && salon.sofaBedCapacity) {
      totalCapacity += salon.sofaBedCapacity;
    }
    
    this.calculatedMaxCapacity = totalCapacity;
    
    // Update maxCapacity if not set or if calculated is different
    if (!this.maxCapacity || this.maxCapacity !== totalCapacity) {
      this.maxCapacity = totalCapacity;
    }
  }
  next();
});

// Add indexes for frequently queried fields
ApartmentSchema.index({ owner: 1 });
ApartmentSchema.index({ name: 1 });

const Apartment: Model<IApartment> = mongoose.models.Apartment || mongoose.model<IApartment>('Apartment', ApartmentSchema);

export default Apartment;

