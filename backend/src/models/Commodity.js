import mongoose from 'mongoose';

const commoditySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a commodity name'],
            unique: true,
            trim: true,
        },
        type: {
            type: String,
            required: [true, 'Please provide a commodity type'],
        },
        icon: {
            type: String,
        },
        navPrice: {
            type: Number,
            required: [true, 'Please provide current Net Asset Value (NAV)'],
            min: [0, 'NAV cannot be negative'],
        },
        basePrice: {
            type: Number,
            required: true,
        },
        markup: {
            type: Number,
            default: 0,
            description: 'Percentage markup for retail price',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        navHistory: [
            {
                price: Number,
                date: { type: Date, default: Date.now },
                updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for searching active commodities
commoditySchema.index({ isActive: 1, name: 1 });

const Commodity = mongoose.model('Commodity', commoditySchema);

export default Commodity;
