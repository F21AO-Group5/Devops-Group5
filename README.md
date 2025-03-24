# Devops-Group5 

# Running the code

1. Prerequisites
    Node.js
    Mongo DB
    Git

2. Clone the repository in you IDE using - git clone https://github.com/F21AO-Group5/Devops-Group5.git

3. cd to the project folder

4. Run the server using - npm run dev

-----------------------------------------------------------------------------------------------------------

# Running API tests with Postman

1. User Registration 

    POST http://localhost:3000/api/auth/register

    Schema - {
        "name" : "",
        "email" : "",
        "password" : "",
        "role" : "admin/doctor/nurse/clerk/paramedics"
    }

    POST http://localhost:3000/api/auth/login

    Schema - {
        "email" : "",
        "password" : ""
    }

    GET http://localhost:3000/api/auth/profile

    Authorization
    Auth Type - Bearer Token(token recieved from login)

    DELETE http://localhost:3000/api/auth/{user_ID}

    Authorization
    Auth Type - Bearer Token(token recieved from admin login)

2. Patient Registration

    POST http://localhost:3000/api/patient/register

    Authorization
    Auth Type - Bearer Token(token recieved from clerk login)

    GET http://localhost:3000/api/patient/{patient_ID}

    Authorization
    Auth Type - Bearer Token(token recieved from doctor/nurse/admin/paramedics login)

    DELETE http://localhost:3000/api/patient/{patient_ID}

    Authorization
    Auth Type - Bearer Token(token recieved from clerk login)

3. Patient Treatment

    POST http://localhost:3000/api/treatment/{patient_ID}

    Schema - {
        "diagnosis": "",
        "prescription": "",
        "referral": ""
    }

    Authorization
    Auth Type - Bearer Token(token recieved from doctor/paramedics login)

    PUT http://localhost:3000/api/treatment/{treatment_ID}

    Schema - {
        "diagnosis": "",
        "prescription": "",
        "referral": ""
    }

    Authorization
    Auth Type - Bearer Token(token recieved from doctor/paramedics login)

4. Patient Referral by doctor

    POST http://localhost:3000/api/patientreferral/refer

    Schema - {
        "patientId" : "",
        "referredTo" : "",
        "notes" : ""
    }

    Authorization
    Auth Type - Bearer Token(token recieved from doctor login)

5. Lab Registration by clerk/paramedics

    POST http://localhost:3000/api/labregistration/register

    Schema - {
        "referralId" : "",
        "doctorId" : "",
        "diagnosticTest" : ""
    }

    Authorization
    Auth Type - Bearer Token(token recieved from clerk/paramedics login)

6. Lab Results

    POST http://localhost:3000/api/lab/uploadResult/{labRegistration_ID}

    Body - form-data
    key - files (file) 
    value - upload file

    Authorization
    Auth Type - Bearer Token(token recieved from nurse/paramedics login)

    GET http://localhost:3000/api/lab/getResults/{labRegistration_ID}

    Authorization
    Auth Type - Bearer Token(token recieved from doctor/nurse/paramedics login)
    test
