
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Commodity from './src/models/Commodity.js';
import TPIA from './src/models/TPIA.js';
import GDC from './src/models/GDC.js';

dotenv.config();

const realisticCommodities = [
    {
        name: 'Paddy Rice',
        symbol: 'RICE',
        type: 'Grain',
        icon: '🌾',
        navPrice: 450000, // Per Metric Tonne approx
        description: 'Premium parboiled rice suitable for export and local consumption.',
        basePrice: 420000
    },
    {
        name: 'Yellow Maize',
        symbol: 'CORN',
        type: 'Grain',
        icon: '🌽',
        navPrice: 380000,
        description: 'High-quality yellow maize for industrial and animal feed use.',
        basePrice: 350000
    },
    {
        name: 'Cocoa Beans',
        symbol: 'COCO',
        type: 'Cash Crop',
        icon: '🍫',
        navPrice: 1250000,
        description: 'Fermented dried cocoa beans, Nigeria\'s leading non-oil export.',
        basePrice: 1100000
    },
    {
        name: 'Soya Beans',
        symbol: 'SOYA',
        type: 'Legume',
        icon: '🌱',
        navPrice: 480000,
        description: 'Protein-rich soya beans for oil processing and meal production.',
        basePrice: 440000
    },
    {
        name: 'Sesame Seeds',
        symbol: 'SESM',
        type: 'Seed',
        icon: '🌰',
        navPrice: 950000,
        description: 'White sesame seeds known for high oil content.',
        basePrice: 880000
    },
    {
        name: 'Dried Ginger',
        symbol: 'GNGR',
        type: 'Spice',
        icon: '🫚',
        navPrice: 750000,
        description: 'Split dried ginger rhizomes with high oleoresin content.',
        basePrice: 680000
    },
    {
        name: 'Cashew Nuts',
        symbol: 'CASH',
        type: 'Nut',
        icon: '🥜',
        navPrice: 650000,
        description: 'Raw cashew nuts (RCN) with high kernel output ratio.',
        basePrice: 600000
    },
    {
        name: 'Sorghum',
        symbol: 'SORG',
        type: 'Grain',
        icon: '🌾',
        navPrice: 320000,
        description: 'Industrial grade sorghum for brewing and food processing.',
        basePrice: 290000
    }
];

// Helper to generate meaningful fake history
const generateHistory = (basePrice) => {
    const history = [];
    let currentPrice = basePrice;
    const days = 30;

    // Create 30 days of history
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Random daily fluctuation between -1.5% and +1.8% (slightly bullish)
        const changePercent = (Math.random() * 0.033) - 0.015;
        currentPrice = currentPrice * (1 + changePercent);

        history.push({
            price: Math.round(currentPrice),
            date: date,
            updatedBy: null // System update
        });
    }
    return history;
};

const seedMarket = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        // 1. Cleanup old test data? 
        // We will remove commodities with "Test" or "Standard TPIA" in name
        console.log('🧹 Cleaning up test commodities...');
        const deleteResult = await Commodity.deleteMany({
            name: { $in: ['Standard TPIA', 'Test Gold', 'Test Commodity'] }
        });
        console.log(`   Deleted ${deleteResult.deletedCount} test commodities.`);

        // Also want to clear GDCs/TPIAs associated with deleted commodities?
        // Might be dangerous if we want to preserve the "User Dashboard" seed data we saw earlier.
        // For now, we'll leave TPIAs linked to old IDs (they might break or show "Unknown"), 
        // OR we can update them to point to new ones.

        // Let's just insert the new ones first.

        console.log('📈 Seeding realistic commodities...');
        for (const item of realisticCommodities) {
            // Check if exists
            const exists = await Commodity.findOne({ symbol: item.symbol });
            if (exists) {
                console.log(`   Skipping ${item.name} (already exists)`);
                continue;
            }

            // Generate history
            const history = generateHistory(item.basePrice);
            // Ensure the last history point matches currrent navPrice approximately, or just update navPrice to match history
            const currentNav = history[history.length - 1].price;

            await Commodity.create({
                ...item,
                navPrice: currentNav,
                navHistory: history,
                isActive: true
            });
            console.log(`   ✅ Created ${item.name} (${item.symbol}) @ ₦${currentNav.toLocaleString()}`);
        }

        console.log('\n✨ Market Seeding Completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedMarket();
