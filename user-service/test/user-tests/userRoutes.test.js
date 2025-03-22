
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

const app = require('../../index');
const User = require('../../models/Users');

chai.use(chaiHttp);
const expect = chai.expect;

describe('User Service Tests', () => {
    let adminToken;
    let doctorToken;
    let testUserId;
    const testAdmin = {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'securepassword',
        role: 'admin'
    };

    before(async () => {

       
        await mongoose.connect(config.get('mongoURI'));
        await User.deleteMany({});
        
        // Create test 
        const hashedPassword = await bcrypt.hash(testAdmin.password, 10);
        const adminUser = await User.create({
            ...testAdmin,
            password: hashedPassword
        });
        
        // Generate tokens
        adminToken = jwt.sign(
            { id: adminUser._id, role: 'admin' },
            config.get('JWT_SECRET'),
            { expiresIn: '6h' }
        );
        
        doctorToken = jwt.sign(
            { id: new mongoose.Types.ObjectId(), role: 'doctor' },
            config.get('JWT_SECRET'),
            { expiresIn: '6h' }
        );
    });

    beforeEach(async () => {
        
        const testUser = await User.create({
            name: 'Test User',
            email: 'test@user.com',
            password: await bcrypt.hash('testpassword', 10),
            role: 'nurse'
        });
        testUserId = testUser._id;
    });

    afterEach(async () => {
        await User.deleteMany({ role: { $ne: 'admin' }});
    });

    after(async () => {
        await mongoose.disconnect();
    });

    //Test Cases for Post

    describe('POST /api/auth/register', () => {
        it('should register new user with valid data', async () => {
            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'new@user.com',
                    password: 'Test@1234',
                    role: 'doctor'
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('message', 'User registered successfully');
        });

        it('should return 400 for invalid role', async () => {
            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Invalid Role',
                    email: 'invalid@role.com',
                    password: 'Test@1234',
                    role: 'invalid_role'
                });

            expect(res).to.have.status(400);
        });

        it('should return 400 for duplicate email', async () => {
            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'test@user.com',
                    password: 'Test@1234',
                    role: 'nurse'
                });

            expect(res).to.have.status(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testAdmin.email,
                    password: testAdmin.password
                });

            expect(res).to.have.status(200);
            expect(res.body).to.have.keys(['token', 'role', 'userId']);
        });

        it('should return 400 for invalid password', async () => {
            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testAdmin.email,
                    password: 'wrongpassword'
                });

            expect(res).to.have.status(400);
        });
    });

    // Test Cases for Get
    describe('GET /api/auth/profile', () => {
        it('should fetch user profile with valid token', async () => {
            const res = await chai.request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('email', testAdmin.email);
            expect(res.body).to.not.have.property('password');
        });

        it('should return 401 without token', async () => {
            const res = await chai.request(app)
                .get('/api/auth/profile');

            expect(res).to.have.status(401);
        });
    });

    describe('GET /api/auth/all-users', () => {
        it('should return all users for admin', async () => {
            const res = await chai.request(app)
                .get('/api/auth/all-users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
        });

        it('should return 403 for non-admin users', async () => {
            const res = await chai.request(app)
                .get('/api/auth/all-users')
                .set('Authorization', `Bearer ${doctorToken}`);

            expect(res).to.have.status(403);
        });
    });
    
    //Test Cases for Delete

    describe('DELETE /api/auth/:id', () => {
        it('should delete user by admin', async () => {
            const res = await chai.request(app)
                .delete(`/api/auth/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('msg', 'User deleted successfully');
        });

        it('should return 404 for non-existent but valid ID', async () => {
          const fakeId = new mongoose.Types.ObjectId();
          const res = await chai.request(app)
              .delete(`/api/auth/${fakeId}`)
              .set('Authorization', `Bearer ${adminToken}`);

          expect(res).to.have.status(404);
      });

        it('should return 403 for non-admin users', async () => {
            const res = await chai.request(app)
                .delete(`/api/auth/${testUserId}`)
                .set('Authorization', `Bearer ${doctorToken}`);

            expect(res).to.have.status(403);
        });
    });
});