require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database'); // adjust path if needed
const User = require('../models/User');

async function upsertUser(user) {
  const existing = await User.findOne({ email: user.email });
  if (existing) {
    console.log(`Updating existing user ${user.email}`);
    // Update selective fields but keep password if not provided
    existing.firstName = user.firstName || existing.firstName;
    existing.lastName = user.lastName || existing.lastName;
    existing.businessName = user.businessName || existing.businessName;
    existing.phone = user.phone || existing.phone;
    existing.address = user.address || existing.address;
    existing.pincode = user.pincode || existing.pincode;
    existing.services = user.services || existing.services;
    existing.role = user.role || existing.role;
    if (user.password) existing.password = user.password; // triggers pre-save hash
    if (typeof user.isVerified !== 'undefined') existing.isVerified = user.isVerified;
    await existing.save();
    return existing;
  } else {
    console.log(`Creating user ${user.email}`);
    const u = new User(user);
    if (typeof user.isVerified !== 'undefined') u.isVerified = user.isVerified;
    await u.save();
    return u;
  }
}

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not set in env');
    process.exit(1);
  }
  await connectDB(mongoUri);

  const seedUsers = [
    {
      businessName: 'Acme Distributors',
      firstName: 'Ravi',
      lastName: 'Kumar',
      email: 'ravi.admin@example.com',
      phone: '9876543210',
      address: '12 MG Road, Mumbai',
      pincode: '400001',
      services: ['same-day','cod'],
      role: 'organization_admin',
      password: 'OrgAdmin!234',
      isVerified: true
    },
    {
      businessName: 'Acme - Admin Team',
      firstName: 'Priya',
      lastName: 'Shah',
      email: 'priyaa.admin@example.com',
      phone: '9876501234',
      address: '21 Park St, Delhi',
      pincode: '110001',
      services: ['standard'],
      role: 'admin',
      password: 'Admin!234',
      isVerified: true
    },
    {
      firstName: 'Amit',
      lastName: 'Singh',
      email: 'amit.user@example.com',
      phone: '9123456780',
      address: 'Sector 5, Gurgaon',
      pincode: '122001',
      services: ['standard'],
      role: 'user',
      password: 'User!234',
      isVerified: true
    }
  ];

  for (const u of seedUsers) {
    try {
      await upsertUser(u);
    } catch (err) {
      console.error('Failed to upsert', u.email, err);
    }
  }

  console.log('Seeding complete. Disconnecting.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Seed script failed', err);
  process.exit(1);
});
