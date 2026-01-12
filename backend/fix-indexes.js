import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fix() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37_db';
    console.log(`Connecting to ${uri}...`);

    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        const collection = db.collection('wallets');

        console.log('Fetching indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Check for ledger.reference_1 or ledger.reference index
        const indexName = indexes.find(idx => idx.name === 'ledger.reference_1') ? 'ledger.reference_1' : null;

        if (indexName) {
            console.log(`Found index ${indexName}. Dropping...`);
            await collection.dropIndex(indexName);
            console.log('✅ Index dropped successfully.');
        } else {
            console.log('ℹ️ Index ledger.reference_1 not found.');

            // Look for any unique index on reference
            const uniqueRefIndex = indexes.find(idx => idx.key.reference === 1 && idx.unique);
            if (uniqueRefIndex) {
                console.log(`Found unique index ${uniqueRefIndex.name} on reference. Dropping...`);
                await collection.dropIndex(uniqueRefIndex.name);
                console.log('✅ Unique index dropped successfully.');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing indexes:', err);
        process.exit(1);
    }
}

fix();
