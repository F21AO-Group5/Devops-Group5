const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
 
const app = require('../../index');  // Adjust path as needed
const Patient = require('../../models/Patient');
 
chai.use(chaiHttp);
const expect = chai.expect;
 
describe('Patient Routes Tests', () => {
    let clerkToken;
    let doctorToken;
    let nurseToken;
    let testPatient;
 
    // Generate test tokens
    before(() => {
        clerkToken = jwt.sign({ role: 'clerk' }, config.get('JWT_SECRET'));
        doctorToken = jwt.sign({ role: 'doctor' }, config.get('JWT_SECRET'));
        nurseToken = jwt.sign({ role: 'nurse' }, config.get('JWT_SECRET'));
    });
 
    // Clean database and create test patient before each test
    beforeEach(async () => {
        await Patient.deleteMany({});
        testPatient = await Patient.create({
            name: 'Test Patient',
            age: 35,
            gender: 'male',
            contact: '1234567890',
            servicePoint: 'OPD'
        });
    });
 
    describe('POST /api/patient/register', () => {
        it('should create a new patient with valid clerk credentials', async () => {
            const res = await chai.request(app)
                .post('/api/patient/register')
                .set('Authorization', `Bearer ${clerkToken}`)
                .send({
                    name: 'New Patient',
                    age: 25,
                    gender: 'female',
                    contact: '0987654321',
                    servicePoint: 'A&E'
                });
 
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('msg', 'Patient registered successfully');
            expect(res.body.patient).to.have.property('name', 'New Patient');
        });
 
        it('should return 403 for non-clerk roles', async () => {
            const res = await chai.request(app)
                .post('/api/patient/register')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send({
                    name: 'New Patient',
                    age: 25,
                    gender: 'female',
                    contact: '0987654321',
                    servicePoint: 'A&E'
                });
 
            expect(res).to.have.status(403);
            expect(res.body).to.have.property('message', 'Access Denied: Insufficient Permissions');
        });
 
        it('should return 401 for unauthenticated requests', async () => {
            const res = await chai.request(app)
                .post('/api/patient/register')
                .send({
                    name: 'New Patient',
                    age: 25,
                    gender: 'female',
                    contact: '0987654321',
                    servicePoint: 'A&E'
                });
 
            expect(res).to.have.status(401);
        });
    });
 
    describe('GET /api/patient/:id', () => {
        it('should retrieve patient details for authorized roles', async () => {
            const res = await chai.request(app)
                .get(`/api/patient/${testPatient._id}`)
                .set('Authorization', `Bearer ${doctorToken}`);
 
            expect(res).to.have.status(200);
            expect(res.body.patient).to.have.property('name', 'Test Patient');
        });
 
        it('should return 403 for unauthorized roles', async () => {
            const res = await chai.request(app)
                .get(`/api/patient/${testPatient._id}`)
                .set('Authorization', `Bearer ${clerkToken}`);
 
            expect(res).to.have.status(403);
        });
 
    });
 
    describe('DELETE /api/patient/:id', () => {
        it('should delete patient with valid clerk credentials', async () => {
            const res = await chai.request(app)
                .delete(`/api/patient/${testPatient._id}`)
                .set('Authorization', `Bearer ${clerkToken}`);
 
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('msg', 'Patient record deleted successfully');
 
            const deletedPatient = await Patient.findById(testPatient._id);
            expect(deletedPatient).to.be.null;
        });
 
        it('should return 403 for non-clerk roles', async () => {
            const res = await chai.request(app)
                .delete(`/api/patient/${testPatient._id}`)
                .set('Authorization', `Bearer ${doctorToken}`);
 
            expect(res).to.have.status(403);
        });
 
        it('should return 404 for non-existent patient', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await chai.request(app)
                .delete(`/api/patient/${fakeId}`)
                .set('Authorization', `Bearer ${clerkToken}`);
 
            expect(res).to.have.status(404);
        });
    });
});