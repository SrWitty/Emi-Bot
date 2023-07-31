const { Events } = require('discord.js');
const mongoose = require('mongoose');

const mongodbURL = process.env.db;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready!');

        if (!mongodbURL) return;

        mongoose.set("strictQuery", false);
        await mongoose.connect(mongodbURL, {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        if (mongoose.connection) {
            console.log('Database is up and running!');
        }

    },
};