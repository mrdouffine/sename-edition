
const mongoose = require('mongoose');

async function test() {
    const uri = 'mongodb://127.0.0.1:27022/livreo';
    try {
        await mongoose.connect(uri);
        const Order = mongoose.connection.db.collection('orders');
        const order = await Order.findOne({});
        console.log('Sample Order:', order);
        const User = mongoose.connection.db.collection('users');
        const user = await User.findOne({});
        console.log('Sample User:', user);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
