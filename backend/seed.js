const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartlearning');

    console.log('MongoDB Connected...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'umer99@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists. Updating...');
      existingAdmin.name = 'Admin';
      existingAdmin.password = '1234';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin user updated successfully!');
    } else {
      await User.create({
        name: 'Admin',
        email: 'umer99@gmail.com',
        password: '1234',
        role: 'admin',
      });
      console.log('Admin user created successfully!');
    }

    console.log('Email: umer99@gmail.com');
    console.log('Password: 1234');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();