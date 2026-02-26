
const mongoose = require('mongoose');

async function test() {
    const uri = 'mongodb://127.0.0.1:27022/livreo';
    console.log('Connecting to:', uri);
    try {
        await mongoose.connect(uri);
        console.log('Connected successfully');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

test();
