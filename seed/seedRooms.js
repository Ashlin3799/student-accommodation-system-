// Run with: node seed/seedRooms.js
global.crypto = require("crypto").webcrypto;

require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../src/models/Room');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/room_management';

const sampleRooms = [
  {
    roomNumber: 'A-101',
    building: 'Hillcrest Hall',
    floor: 1,
    type: 'single',
    capacity: 1,
    occupied: 0,
    pricePerMonth: 450,
    status: 'available',
    amenities: ['wifi', 'desk', 'wardrobe', 'attached bathroom'],
    description: 'Cozy single room with natural light and a study desk.',
  },
  {
    roomNumber: 'A-102',
    building: 'Hillcrest Hall',
    floor: 1,
    type: 'double',
    capacity: 2,
    occupied: 1,
    pricePerMonth: 300,
    status: 'available',
    amenities: ['wifi', 'shared bathroom', 'bunk bed'],
    description: 'Shared double room, great for students who like company.',
  },
  {
    roomNumber: 'A-201',
    building: 'Hillcrest Hall',
    floor: 2,
    type: 'single',
    capacity: 1,
    occupied: 1,
    pricePerMonth: 470,
    status: 'occupied',
    amenities: ['wifi', 'desk', 'balcony'],
    description: 'Single room with a small balcony overlooking the courtyard.',
  },
  {
    roomNumber: 'B-101',
    building: 'Maple Residence',
    floor: 1,
    type: 'dorm',
    capacity: 6,
    occupied: 3,
    pricePerMonth: 180,
    status: 'available',
    amenities: ['wifi', 'lockers', 'shared bathroom', 'common lounge'],
    description: 'Budget-friendly 6-bed dorm, popular with first-year students.',
  },
  {
    roomNumber: 'B-102',
    building: 'Maple Residence',
    floor: 1,
    type: 'dorm',
    capacity: 6,
    occupied: 6,
    pricePerMonth: 180,
    status: 'occupied',
    amenities: ['wifi', 'lockers', 'shared bathroom'],
    description: 'Fully booked 6-bed dorm.',
  },
  {
    roomNumber: 'B-205',
    building: 'Maple Residence',
    floor: 2,
    type: 'triple',
    capacity: 3,
    occupied: 0,
    pricePerMonth: 260,
    status: 'available',
    amenities: ['wifi', 'shared bathroom', 'study table'],
    description: 'Spacious triple room, recently renovated.',
  },
  {
    roomNumber: 'C-301',
    building: 'Oakwood Tower',
    floor: 3,
    type: 'suite',
    capacity: 2,
    occupied: 0,
    pricePerMonth: 650,
    status: 'available',
    amenities: ['wifi', 'kitchenette', 'private bathroom', 'air conditioning'],
    description: 'Premium suite with a small kitchenette, ideal for couples or friends.',
  },
  {
    roomNumber: 'C-302',
    building: 'Oakwood Tower',
    floor: 3,
    type: 'single',
    capacity: 1,
    occupied: 0,
    pricePerMonth: 500,
    status: 'maintenance',
    amenities: ['wifi', 'desk'],
    description: 'Currently under maintenance, plumbing being fixed.',
  },
  {
    roomNumber: 'C-401',
    building: 'Oakwood Tower',
    floor: 4,
    type: 'double',
    capacity: 2,
    occupied: 2,
    pricePerMonth: 340,
    status: 'reserved',
    amenities: ['wifi', 'private bathroom'],
    description: 'Reserved for exchange students arriving next semester.',
  },
  {
    roomNumber: 'D-101',
    building: 'Riverside House',
    floor: 1,
    type: 'single',
    capacity: 1,
    occupied: 0,
    pricePerMonth: 420,
    status: 'available',
    amenities: ['wifi', 'desk', 'garden view'],
    description: 'Ground floor single room with a view of the garden.',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', MONGO_URI);

    await Room.deleteMany({});
    console.log('Cleared existing rooms.');

    const inserted = await Room.insertMany(sampleRooms);
    console.log(`Inserted ${inserted.length} sample rooms.`);

    await mongoose.disconnect();
    console.log('Done. Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();