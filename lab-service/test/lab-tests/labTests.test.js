const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const path = require('path');
const fs = require('fs');

const app = require('../../index');
const LabRegistration = require('../../models/lab_Registeration');
const PatientReferral = require('../../models/patient_referral');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Lab Service Tests', () => {
    let clerkToken, nurseToken, doctorToken, paramedicToken;
    let validReferral, invalidReferral;
    let testLabRegistration;
    const testFiles = {
        jpg: path.join(__dirname, 'test-file.jpg'),
        txt: path.join(__dirname, 'test-file.txt')
    };

    before(async () => {
        // Create test files
        fs.writeFileSync(testFiles.jpg, 'dummy');
        fs.writeFileSync(testFiles.txt, 'dummy');

        // Generate tokens
        clerkToken = jwt.sign({ role: 'clerk' }, config.get('JWT_SECRET'));
        nurseToken = jwt.sign({ role: 'nurse' }, config.get('JWT_SECRET'));
        doctorToken = jwt.sign({ role: 'doctor' }, config.get('JWT_SECRET'));
        paramedicToken = jwt.sign({ role: 'paramedics' }, config.get('JWT_SECRET'));

        // Create test referrals
        validReferral = await PatientReferral.create({
            patientId: new mongoose.Types.ObjectId(),
            doctorId: new mongoose.Types.ObjectId(),
            referredTo: 'Pathology'
        });

        invalidReferral = await PatientReferral.create({
            patientId: new mongoose.Types.ObjectId(),
            doctorId: new mongoose.Types.ObjectId(),
            referredTo: 'Radiology'
        });
    });

    beforeEach(async () => {
        // Create test lab registration
        testLabRegistration = await LabRegistration.create({
            patient_Id: new mongoose.Types.ObjectId(),
            doctor_Id: new mongoose.Types.ObjectId(),
            labTest: 'Blood Test'
        });
    });

    afterEach(async () => {
        await LabRegistration.deleteMany({});
    });

    after(async () => {
        // Cleanup files and database
        fs.unlinkSync(testFiles.jpg);
        fs.unlinkSync(testFiles.txt);
        await PatientReferral.deleteMany({});
        await mongoose.disconnect();
    });

    describe('POST /api/labregistration/register', () => {
        it('should successfully register lab test with valid referral (clerk)', async () => {
            const res = await chai.request(app)
                .post('/api/labregistration/register')
                .set('Authorization', `Bearer ${clerkToken}`)
                .send({
                    referralId: validReferral._id,
                    diagnosticTest: 'Complete Blood Count'
                });

            expect(res).to.have.status(201);
            expect(res.body.labRegistration).to.exist;
        });

        it('should reject non-pathology referrals (paramedic)', async () => {
            const res = await chai.request(app)
                .post('/api/labregistration/register')
                .set('Authorization', `Bearer ${paramedicToken}`)
                .send({
                    referralId: invalidReferral._id,
                    diagnosticTest: 'X-Ray Scan'
                });

            expect(res).to.have.status(400);
        });

        it('should prevent unauthorized roles (nurse)', async () => {
            const res = await chai.request(app)
                .post('/api/labregistration/register')
                .set('Authorization', `Bearer ${nurseToken}`)
                .send({
                    referralId: validReferral._id,
                    diagnosticTest: 'Urine Test'
                });

            expect(res).to.have.status(403);
        });
    });

    describe('POST /api/lab/uploadResult/:id', () => {
        it('should upload results with valid files (nurse)', async () => {
            const res = await chai.request(app)
                .post(`/api/lab/uploadResult/${testLabRegistration._id}`)
                .set('Authorization', `Bearer ${nurseToken}`)
                .attach('files', fs.readFileSync(testFiles.jpg), 'test.jpg')
                .field('result', 'Positive');

            expect(res).to.have.status(201);
            expect(res.body.files).to.have.lengthOf(1);
        });

        // it('should reject invalid file types (paramedic)', async () => {
        //     const res = await chai.request(app)
        //         .post(`/api/lab/uploadResult/${testLabRegistration._id}`)
        //         .set('Authorization', `Bearer ${paramedicToken}`)
        //         .attach('files', fs.readFileSync(testFiles.txt), 'test.txt')
        //         .field('result', 'Negative');

        //     expect(res).to.have.status(400);
        // });

        

        it('should prevent duplicate uploads (nurse)', async () => {
            // First upload
            await chai.request(app)
                .post(`/api/lab/uploadResult/${testLabRegistration._id}`)
                .set('Authorization', `Bearer ${nurseToken}`)
                .attach('files', fs.readFileSync(testFiles.jpg), 'test.jpg')
                .field('result', 'Positive');

            // Second upload
            const res = await chai.request(app)
                .post(`/api/lab/uploadResult/${testLabRegistration._id}`)
                .set('Authorization', `Bearer ${nurseToken}`)
                .attach('files', fs.readFileSync(testFiles.jpg), 'test.jpg')
                .field('result', 'Positive');

            expect(res).to.have.status(400);
        });
    });

    describe('GET /api/lab/getResults/:id', () => {
        it('should retrieve results with valid ID (doctor)', async () => {
            // First upload results
            await chai.request(app)
                .post(`/api/lab/uploadResult/${testLabRegistration._id}`)
                .set('Authorization', `Bearer ${nurseToken}`)
                .attach('files', fs.readFileSync(testFiles.jpg), 'test.jpg')
                .field('result', 'Positive');

            const res = await chai.request(app)
                .get(`/api/lab/getResults/${testLabRegistration._id}`)
                .set('Authorization', `Bearer ${doctorToken}`);

            expect(res).to.have.status(200);
            expect(res.body.resultFiles).to.be.an('array');
        });

        
        it('should return 404 for non-existent ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await chai.request(app)
                .get(`/api/lab/getResults/${fakeId}`)
                .set('Authorization', `Bearer ${doctorToken}`);

            expect(res).to.have.status(404);
        });
    });

    describe('Authorization & Validation', () => {
        it('should block unauthenticated registration attempts', async () => {
            const res = await chai.request(app)
                .post('/api/labregistration/register')
                .send({ referralId: validReferral._id });

            expect(res).to.have.status(401);
        });

        it('should reject expired/invalid tokens', async () => {
            const expiredToken = jwt.sign(
                { role: 'nurse' }, 
                config.get('JWT_SECRET'), 
                { expiresIn: '1ms' }
            );
            
            await new Promise(resolve => setTimeout(resolve, 2));
            
            const res = await chai.request(app)
                .post(`/api/lab/uploadResult/${testLabRegistration._id}`)
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(res).to.have.status(400);
        });
    });
});