const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const app = require('../../index');
const PatientReferral = require('../../models/patient_referral');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Referral Service Tests', () => {
    let doctorToken;
    let clerkToken;
    let testPatientId;
    let testDoctorId;

    before(() => {
        // Generate test IDs
        testPatientId = new mongoose.Types.ObjectId();
        testDoctorId = new mongoose.Types.ObjectId();

        // Generate tokens
        doctorToken = jwt.sign(
            { id: testDoctorId, role: 'doctor' }, 
            config.get('JWT_SECRET')
        );
        clerkToken = jwt.sign(
            { id: new mongoose.Types.ObjectId(), role: 'clerk' },
            config.get('JWT_SECRET')
        );
    });

    beforeEach(async () => {
        await PatientReferral.deleteMany({});
    });

    after(async () => {
        await mongoose.disconnect();
    });

    describe('POST /api/patientreferral/refer', () => {
        it('should create referral with valid doctor credentials', async () => {
            const res = await chai.request(app)
                .post('/api/patientreferral/refer')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send({
                    patientId: testPatientId,
                    referredTo: 'Radiology',
                    notes: 'CT Scan required'
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('message', 'patient referred to service');
            expect(res.body.referral).to.have.property('referredTo', 'Radiology');
        });

        it('should return 403 for non-doctor roles', async () => {
            const res = await chai.request(app)
                .post('/api/patientreferral/refer')
                .set('Authorization', `Bearer ${clerkToken}`)
                .send({
                    patientId: testPatientId,
                    referredTo: 'Pathology'
                });

            expect(res).to.have.status(403);
            expect(res.body).to.have.property('message', 'Access Denied: Insufficient Permissions');
        });

        it('should return 401 for unauthenticated requests', async () => {
            const res = await chai.request(app)
                .post('/api/patientreferral/refer')
                .send({
                    patientId: testPatientId,
                    referredTo: 'ICU'
                });

            expect(res).to.have.status(401);
        });

        it('should return 400 for invalid referral data', async () => {
            const res = await chai.request(app)
                .post('/api/patientreferral/refer')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send({
                    patientId: 'invalid-id',
                    referredTo: 'InvalidDepartment'
                });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error');
        });

        it('should return 400 when missing required fields', async () => {
            const res = await chai.request(app)
                .post('/api/patientreferral/refer')
                .set('Authorization', `Bearer ${doctorToken}`)
                .send({
                    referredTo: 'Physiotherapy'
                });

            expect(res).to.have.status(400);
        });
    });
});