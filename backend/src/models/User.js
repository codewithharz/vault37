import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import config from '../config/env.js';

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Please provide your full name'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: { type: String, default: 'Nigeria' },
        },
        dateOfBirth: Date,
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't return password by default
        },
        phone: {
            type: String,
            required: [true, 'Please provide a phone number'],
            validate: {
                validator: function (v) {
                    // Nigerian phone number format: +234XXXXXXXXXX or 0XXXXXXXXXXX
                    return /^(\+234|0)[789][01]\d{8}$/.test(v);
                },
                message: 'Please provide a valid Nigerian phone number (e.g., +2348012345678 or 08012345678)',
            },
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'auditor', 'accountant'],
            default: 'user',
        },
        kycStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
        },
        kycDocuments: {
            idType: {
                type: String,
                enum: ['NIN', 'drivers_license', 'passport', 'voters_card'],
            },
            idNumber: String,
            documentUrl: String,
            submittedAt: Date,
            verifiedAt: Date,
            rejectionReason: String,
        },
        mode: {
            type: String,
            enum: ['TPM', 'EPS'],
            default: 'TPM',
            description: 'TPM = Trade Profit Mode (compound), EPS = Earnings Payout System (withdraw)',
        },
        referralCode: {
            type: String,
            unique: true,
            sparse: true, // Allow multiple null values
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        // Security fields
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        refreshTokens: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, isActive: 1 });

// Virtual for wallet
userSchema.virtual('wallet', {
    ref: 'Wallet',
    localField: '_id',
    foreignField: 'userId',
    justOne: true,
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Normalize phone number before validation
userSchema.pre('validate', function (next) {
    if (this.phone) {
        // Strip spaces and hyphens, keep + at start if present
        const prefix = this.phone.startsWith('+') ? '+' : '';
        const numeric = this.phone.replace(/[^\d]/g, '');
        this.phone = prefix === '+' ? `+${numeric}` : numeric;
    }
    next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();

    try {
        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(config.bcryptRounds);
        this.password = await bcrypt.hash(this.password, salt);

        // Update passwordChangedAt
        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token is created after password change
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Generate unique referral code before saving
userSchema.pre('save', async function (next) {
    if (!this.isNew || this.referralCode) return next();

    try {
        // Generate referral code: VAULT37 + random 6 chars
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = 'VAULT37';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        let referralCode;
        let codeExists = true;

        // Ensure uniqueness
        while (codeExists) {
            referralCode = generateCode();
            const existing = await this.constructor.findOne({ referralCode });
            if (!existing) codeExists = false;
        }

        this.referralCode = referralCode;
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method: Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
    // If lock has expired, reset attempts
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }

    // Increment attempts
    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account if max attempts reached
    if (this.loginAttempts + 1 >= config.maxLoginAttempts && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + config.lockoutDuration };
    }

    return await this.updateOne(updates);
};

// Instance method: Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
    return await this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};

// Instance method: Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

const User = mongoose.model('User', userSchema);

export default User;
