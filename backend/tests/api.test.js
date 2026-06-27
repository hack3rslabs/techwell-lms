const request = require('supertest');

jest.mock('otplib', () => ({
    generateSecret: jest.fn(),
    verify: jest.fn(),
    generateURI: jest.fn()
}));

const app = require('../src/index');

describe('API Health Check', () => {
    it('should return health status', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('database');
    });
});
