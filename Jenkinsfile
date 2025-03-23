pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = credentials('docker-hub-id').username
        DOCKER_HUB_PASS = credentials('docker-hub-id').password
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/F21AO-Group5/Devops-Group5.git'
            }
        }

        stage('Docker Login') {
            steps {
                script {
                    sh "echo $DOCKER_HUB_PASS | docker login -u $DOCKER_HUB_USER --password-stdin"
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_HUB_USER/user-service ./user-service'
                    sh 'docker build -t $DOCKER_HUB_USER/patient-service ./patient-service'
                    sh 'docker build -t $DOCKER_HUB_USER/referral-service ./referral-service'
                    sh 'docker build -t $DOCKER_HUB_USER/lab-service ./lab-service'
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    sh 'docker push $DOCKER_HUB_USER/user-service'
                    sh 'docker push $DOCKER_HUB_USER/patient-service'
                    sh 'docker push $DOCKER_HUB_USER/referral-service'
                    sh 'docker push $DOCKER_HUB_USER/lab-service'
                }
            }
        }

        stage('Deploy Using Docker Compose') {
            steps {
                script {
                    // Optional: Stop old containers
                    sh 'docker-compose down || true'

                    // Recreate containers with latest image
                    sh 'docker-compose pull'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }

    post {
        success {
            echo '✅ CI/CD Pipeline completed successfully.'
        }
        failure {
            echo '❌ CI/CD Pipeline failed. Check logs.'
        }
    }
}
