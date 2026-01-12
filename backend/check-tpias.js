import mongoose from 'mongoose';
import TPIA from './src/models/TPIA.js';
import GDC from './src/models/GDC.js';
import config from './src/config/env.js';

async function checkTPIAs() {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to Database');

    const allTPIAs = await TPIA.find({}).select('tpiaNumber cycleStartMode currentCycle status');
    console.log('\nAll TPIAs:');
    allTPIAs.forEach(t => {
        console.log(`TPIA ${t.tpiaNumber}: mode=${t.cycleStartMode}, cycle=${t.currentCycle}, status=${t.status}`);
    });

    const gdcs = await GDC.find({});
    console.log(`\nFound ${gdcs.length} GDCs`);
    gdcs.forEach(g => {
        console.log(`GDC ${g.gdcNumber}: status=${g.status}, fill=${g.currentFill}, tpias=${g.tpias.length}`);
    });

    await mongoose.disconnect();
    process.exit(0);
}

checkTPIAs();
