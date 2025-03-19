pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('ak2267')
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning repository...'
                git 'https://github.com/F21AO-Group5/Devops-Group5.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo 'Building Docker images...'
                    sh 'docker build -t user-service ./user-service || exit 1'
                    sh 'docker build -t patient-service ./patient-service || exit 1'
                    sh 'docker build -t referral-service ./referral-service || exit 1'
                    sh 'docker build -t lab-service ./lab-service || exit 1'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo 'Logging into Docker Hub...'
                    sh 'docker login -u $ak2267 -p $Mahin@2718$ || exit 1'
                    echo 'Pushing images to Docker Hub...'
                    sh 'docker tag user-service ak2267/user-service || exit 1'
                    sh 'docker tag patient-service ak2267/patient-service || exit 1'
                    sh 'docker tag referral-service ak2267/referral-service || exit 1'
                    sh 'docker tag lab-service ak2267/lab-service || exit 1'
                    sh 'docker push ak2267/user-service || exit 1'
                    sh 'docker push ak2267/patient-service || exit 1'
                    sh 'docker push ak2267/referral-service || exit 1'
                    sh 'docker push ak2267/lab-service || exit 1'
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo 'Deploying using Docker Compose...'
                    sh 'docker-compose down || exit 1'
                    sh 'docker-compose pull || exit 1'
                    sh 'docker-compose up -d || exit 1'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Deployment Failed!'
        }
    }
}
