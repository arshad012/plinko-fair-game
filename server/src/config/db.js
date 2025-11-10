const mongoose = require('mongoose');

module.exports = () => {
    const uri = process.env.MONGO_URI;
    mongoose.set('strictQuery', false);
    mongoose.connect(uri, {
        // useNewUrlParser/useUnifiedTopology are defaults in mongoose v7+
    }).then(() => {
        console.log('MongoDB connected');
    }).catch(err => {
        console.error('MongoDB connection error', err);
        process.exit(1);
    });
};
