const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("→ MONGO_URI is:", process.env.MONGO_URI); // Debug log

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(' MongoDB connection failed:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;



