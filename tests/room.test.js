// Automated tests for the Room Management module (Sanika's Sprint 1 allocation).
//
// The Room model is mocked, so these tests run fast and don't require a
// live MongoDB connection — useful for CI and for running live during
// the 9.2D demo.
//
// Run with: npm test

const request = require('supertest');
const app = require('./testApp');
const Room = require('../src/models/Room');

// IMPORTANT: don't use plain jest.mock('../src/models/Room') here.
// Jest's automocker doesn't reliably detect methods on Mongoose models
// (find, create, findByIdAndUpdate, etc.), so it silently produces an
// object where those methods are undefined instead of jest.fn() stubs.
// Passing an explicit factory guarantees every method we call in these
// tests actually exists as a mock function.
jest.mock('../src/models/Room', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

const sampleRoom = {
  _id: '652f1f1f1f1f1f1f1f1f1f1f',
  roomNumber: 'A-101',
  building: 'Hillcrest Hall',
  floor: 1,
  type: 'single',
  capacity: 1,
  occupied: 0,
  pricePerMonth: 450,
  currency: 'USD',
  status: 'available',
  amenities: ['wifi', 'desk'],
  images: [],
  description: 'Cozy single room.'
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/rooms', () => {
  it('returns all rooms with no query params', async () => {
    const sortMock = jest.fn().mockResolvedValue([sampleRoom]);
    Room.find.mockReturnValue({ sort: sortMock });

    const res = await request(app).get('/api/rooms');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(Room.find).toHaveBeenCalledWith({});
  });

  it('applies type, status and price filters together', async () => {
    const sortMock = jest.fn().mockResolvedValue([sampleRoom]);
    Room.find.mockReturnValue({ sort: sortMock });

    const res = await request(app).get(
      '/api/rooms?type=single&status=available&minPrice=100&maxPrice=500'
    );

    expect(res.status).toBe(200);
    expect(Room.find).toHaveBeenCalledWith({
      type: 'single',
      status: 'available',
      pricePerMonth: { $gte: 100, $lte: 500 }
    });
  });

  it('applies a case-insensitive search across roomNumber, building and amenities', async () => {
    const sortMock = jest.fn().mockResolvedValue([sampleRoom]);
    Room.find.mockReturnValue({ sort: sortMock });

    await request(app).get('/api/rooms?search=hillcrest');

    const filterArg = Room.find.mock.calls[0][0];
    expect(filterArg.$or).toEqual([
      { roomNumber: { $regex: 'hillcrest', $options: 'i' } },
      { building: { $regex: 'hillcrest', $options: 'i' } },
      { amenities: { $regex: 'hillcrest', $options: 'i' } }
    ]);
  });

  it('sorts by price ascending when sort=price_asc', async () => {
    const sortMock = jest.fn().mockResolvedValue([sampleRoom]);
    Room.find.mockReturnValue({ sort: sortMock });

    await request(app).get('/api/rooms?sort=price_asc');

    expect(sortMock).toHaveBeenCalledWith({ pricePerMonth: 1 });
  });
});

describe('GET /api/rooms/:id', () => {
  it('returns 200 and the room when found', async () => {
    Room.findById.mockResolvedValue(sampleRoom);

    const res = await request(app).get(`/api/rooms/${sampleRoom._id}`);

    expect(res.status).toBe(200);
    expect(res.body.roomNumber).toBe('A-101');
  });

  it('returns 404 when the room does not exist', async () => {
    Room.findById.mockResolvedValue(null);

    const res = await request(app).get('/api/rooms/doesnotexist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/rooms', () => {
  it('rejects a request missing required fields', async () => {
    const res = await request(app).post('/api/rooms').send({
      roomNumber: 'A-999'
      // building, floor, type, capacity, pricePerMonth all missing
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Room.create).not.toHaveBeenCalled();
  });

  it('rejects an unrecognised status value at the schema level', async () => {
    // Simulates Mongoose's enum validation rejecting the room.
    Room.create.mockRejectedValue({
      name: 'ValidationError',
      errors: { status: { message: '`bogus` is not a valid enum value for path `status`.' } }
    });

    const res = await request(app).post('/api/rooms').send({
      roomNumber: 'A-999',
      building: 'Test Hall',
      floor: 1,
      type: 'single',
      capacity: 1,
      pricePerMonth: 300,
      status: 'bogus'
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('rejects a negative capacity at the schema level', async () => {
    // Simulates Mongoose's min-value validation (capacity has min: 1)
    Room.create.mockRejectedValue({
      name: 'ValidationError',
      errors: {
        capacity: { message: 'Path `capacity` (-1) is less than minimum allowed value (1).' }
      }
    });

    const res = await request(app).post('/api/rooms').send({
      roomNumber: 'A-998',
      building: 'Test Hall',
      floor: 1,
      type: 'single',
      capacity: -1,
      pricePerMonth: 300
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('rejects a negative pricePerMonth at the schema level', async () => {
    // Simulates Mongoose's min-value validation (pricePerMonth has min: 0)
    Room.create.mockRejectedValue({
      name: 'ValidationError',
      errors: {
        pricePerMonth: { message: 'Path `pricePerMonth` (-50) is less than minimum allowed value (0).' }
      }
    });

    const res = await request(app).post('/api/rooms').send({
      roomNumber: 'A-997',
      building: 'Test Hall',
      floor: 1,
      type: 'single',
      capacity: 1,
      pricePerMonth: -50
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('rejects a duplicate roomNumber', async () => {
    // Simulates MongoDB's duplicate-key error for the unique roomNumber index.
    // errorHandler.js has a dedicated branch for err.code === 11000.
    Room.create.mockRejectedValue({
      code: 11000,
      message: 'E11000 duplicate key error collection: rooms index: roomNumber_1'
    });

    const res = await request(app).post('/api/rooms').send({
      roomNumber: 'A-101', // already exists, per seed data
      building: 'Hillcrest Hall',
      floor: 1,
      type: 'single',
      capacity: 1,
      pricePerMonth: 450
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('A record with this information already exists');
  });

  it('creates a room and defaults optional fields when valid', async () => {
    Room.create.mockResolvedValue(sampleRoom);

    const res = await request(app).post('/api/rooms').send({
      roomNumber: 'A-101',
      building: 'Hillcrest Hall',
      floor: 1,
      type: 'single',
      capacity: 1,
      pricePerMonth: 450
    });

    expect(res.status).toBe(201);
    expect(Room.create).toHaveBeenCalledWith(
      expect.objectContaining({
        occupied: 0,
        currency: 'USD',
        status: 'available',
        amenities: [],
        images: [],
        description: ''
      })
    );
  });
});

describe('PUT /api/rooms/:id', () => {
  it('rejects an update with no recognised fields', async () => {
    const res = await request(app)
      .put(`/api/rooms/${sampleRoom._id}`)
      .send({ notARealField: true });

    expect(res.status).toBe(400);
    expect(Room.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects occupied greater than capacity', async () => {
    const res = await request(app)
      .put(`/api/rooms/${sampleRoom._id}`)
      .send({ capacity: 2, occupied: 5 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/occupied cannot exceed capacity/);
  });

  it('updates a room with valid partial data', async () => {
    Room.findByIdAndUpdate.mockResolvedValue({
      ...sampleRoom,
      status: 'maintenance'
    });

    const res = await request(app)
      .put(`/api/rooms/${sampleRoom._id}`)
      .send({ status: 'maintenance' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('maintenance');
    expect(Room.findByIdAndUpdate).toHaveBeenCalledWith(
      sampleRoom._id,
      { status: 'maintenance' },
      { new: true, runValidators: true }
    );
  });

  it('returns 404 when updating a room that does not exist', async () => {
    Room.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/rooms/doesnotexist')
      .send({ status: 'maintenance' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/rooms/:id', () => {
  it('deletes a room that exists', async () => {
    Room.findByIdAndDelete.mockResolvedValue(sampleRoom);

    const res = await request(app).delete(`/api/rooms/${sampleRoom._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when deleting a room that does not exist', async () => {
    Room.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app).delete('/api/rooms/doesnotexist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});