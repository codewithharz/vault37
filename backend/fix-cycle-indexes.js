import mongoose from 'mongoose';
import Cycle from './src/models/Cycle.js';
import config from './src/config/env.js';

async function fixCycleIndexes() {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to Database');

    try {
        // Drop the old unique index
        console.log('Dropping old gdc_1_cycleNumber_1 index...');
        await Cycle.collection.dropIndex('gdc_1_cycleNumber_1');
        console.log('✅ Old index dropped');
    } catch (error) {
        console.log('Index may not exist or already dropped:', error.message);
    }

    // Recreate the index without unique constraint
    console.log('Creating new non-unique gdc_1_cycleNumber_1 index...');
    await Cycle.collection.createIndex({ gdc: 1, cycleNumber: 1 });
    console.log('✅ New index created');

    // List all indexes
    const indexes = await Cycle.collection.indexes();
    console.log('\nCurrent indexes on Cycle collection:');
    indexes.forEach(idx => {
        console.log(`  - ${idx.name}:`, idx.key, idx.unique ? '(UNIQUE)' : '');
    });

    await mongoose.disconnect();
    console.log('\n✅ Migration complete');
    process.exit(0);
}

fixCycleIndexes().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
