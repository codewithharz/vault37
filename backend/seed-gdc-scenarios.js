import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GDC from './src/models/GDC.js';
import Commodity from './src/models/Commodity.js';
import { GDC_STATUS } from './src/config/constants.js';

dotenv.config();

const seedGDCScenarios = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get or create a test commodity
        let commodity = await Commodity.findOne({ name: 'Test Gold' });
        if (!commodity) {
            commodity = await Commodity.create({
                name: 'Test Gold',
                type: 'metal',
                icon: '🥇',
                description: 'Test commodity for GDC scenarios'
            });
            console.log('✅ Created test commodity');
        }

        // Clear existing test GDCs (40+)
        await GDC.deleteMany({ gdcNumber: { $gte: 40 } });
        console.log('🗑️  Cleared existing test GDCs (40+)');

        // Following the EXACT rules:
        // TPIA 1-10 → GDC-10
        // TPIA 11-20 → GDC-20
        // TPIA 21-30 → GDC-30
        // TPIA 31-40 → GDC-40, etc.

        // Scenario 1: FILLING GDC-40 (4/10 TPIAs)
        // TPIAs 31-34 → GDC-40
        const fillingGDC1 = await GDC.create({
            gdcNumber: 40,
            commodityId: commodity._id,
            tpias: Array.from({ length: 4 }, (_, i) => ({
                tpiaId: new mongoose.Types.ObjectId(),
                tpiaNumber: 31 + i,
                userId: new mongoose.Types.ObjectId(),
                purchaseDate: new Date(),
                approvalDate: new Date()
            })),
            currentFill: 4,
            status: GDC_STATUS.FILLING,
            currentCycle: 0,
            totalCycles: 24
        });
        console.log(`✅ Created FILLING GDC-40 (4/10 TPIAs: 31-34)`);

        // Scenario 2: FULL GDC-50 (10/10 TPIAs)
        // TPIAs 41-50 → GDC-50
        const fullGDC = await GDC.create({
            gdcNumber: 50,
            commodityId: commodity._id,
            tpias: Array.from({ length: 10 }, (_, i) => ({
                tpiaId: new mongoose.Types.ObjectId(),
                tpiaNumber: 41 + i,
                userId: new mongoose.Types.ObjectId(),
                purchaseDate: new Date(),
                approvalDate: new Date()
            })),
            currentFill: 10,
            status: GDC_STATUS.FULL,
            currentCycle: 0,
            totalCycles: 24
        });
        console.log(`✅ Created FULL GDC-50 (10/10 TPIAs: 41-50)`);

        // Scenario 3: ACTIVE GDC-60 (10/10 TPIAs, running cycles)
        // TPIAs 51-60 → GDC-60
        const activeGDC = await GDC.create({
            gdcNumber: 60,
            commodityId: commodity._id,
            tpias: Array.from({ length: 10 }, (_, i) => ({
                tpiaId: new mongoose.Types.ObjectId(),
                tpiaNumber: 51 + i,
                userId: new mongoose.Types.ObjectId(),
                purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                approvalDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            })),
            currentFill: 10,
            status: GDC_STATUS.ACTIVE,
            activationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            currentCycle: 5,
            totalCycles: 24,
            nextCycleDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created ACTIVE GDC-60 (Cycle 5/24, TPIAs: 51-60)`);

        // Scenario 4: COMPLETED GDC-70 (all 24 cycles done)
        // TPIAs 61-70 → GDC-70
        const completedGDC = await GDC.create({
            gdcNumber: 70,
            commodityId: commodity._id,
            tpias: Array.from({ length: 10 }, (_, i) => ({
                tpiaId: new mongoose.Types.ObjectId(),
                tpiaNumber: 61 + i,
                userId: new mongoose.Types.ObjectId(),
                purchaseDate: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000),
                approvalDate: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000)
            })),
            currentFill: 10,
            status: GDC_STATUS.COMPLETED,
            activationDate: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000),
            completionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            currentCycle: 24,
            totalCycles: 24
        });
        console.log(`✅ Created COMPLETED GDC-70 (All 24 cycles, TPIAs: 61-70)`);

        // Scenario 5: Another FILLING GDC-80 (2/10 TPIAs)
        // TPIAs 71-72 → GDC-80
        const fillingGDC2 = await GDC.create({
            gdcNumber: 80,
            commodityId: commodity._id,
            tpias: Array.from({ length: 2 }, (_, i) => ({
                tpiaId: new mongoose.Types.ObjectId(),
                tpiaNumber: 71 + i,
                userId: new mongoose.Types.ObjectId(),
                purchaseDate: new Date(),
                approvalDate: new Date()
            })),
            currentFill: 2,
            status: GDC_STATUS.FILLING,
            currentCycle: 0,
            totalCycles: 24
        });
        console.log(`✅ Created FILLING GDC-80 (2/10 TPIAs: 71-72)`);

        console.log('\n🎉 Successfully seeded GDC test scenarios!');
        console.log('\n📊 Summary:');
        console.log('   - 2 FILLING GDCs (GDC-40, GDC-80)');
        console.log('   - 1 FULL GDC (GDC-50)');
        console.log('   - 1 ACTIVE GDC (GDC-60)');
        console.log('   - 1 COMPLETED GDC (GDC-70)');
        console.log('\n💡 You can now test the Admin GDC page filtering!');
        console.log('\n📝 Following EXACT numbering rules:');
        console.log('   TPIAs 31-40 → GDC-40');
        console.log('   TPIAs 41-50 → GDC-50');
        console.log('   TPIAs 51-60 → GDC-60');
        console.log('   TPIAs 61-70 → GDC-70');
        console.log('   TPIAs 71-80 → GDC-80');

    } catch (error) {
        console.error('❌ Error seeding GDC scenarios:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    }
};

seedGDCScenarios();
