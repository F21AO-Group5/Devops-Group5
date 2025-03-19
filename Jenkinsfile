pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('ak2267')
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/F21AO-Group5/Devops-Group5.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t user-service ./user-service'
                    sh 'docker build -t patient-service ./patient-service'
                    sh 'docker build -t referral-service ./referral-service'
                    sh 'docker build -t lab-service ./lab-service'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    sh 'docker login -u $ak2267 -p $Mahin@2718$'
                    sh 'docker tag user-service ak2267/user-service'
                    sh 'docker tag patient-service ak2267/patient-service'
                    sh 'docker tag referral-service ak2267/referral-service'
                    sh 'docker tag lab-service ak2267/lab-service'
                    sh 'docker push ak2267/user-service'
                    sh 'docker push ak2267/patient-service'
                    sh 'docker push ak2267/referral-service'
                    sh 'docker push ak2267/lab-service'
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    sh 'docker-compose down'
                    sh 'docker-compose pull'
                    sh 'docker-compose up -d'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Deployment Failed!'
        }
    }
}
