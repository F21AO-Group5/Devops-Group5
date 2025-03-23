pipeline {
    agent any

    environment {
        // Docker Hub username (not a secret, just for image tagging)
        DOCKERHUB_ACCOUNT = 'ak2267'  // TODO: replace with your Docker Hub username
    }

    stages {
        stage('Checkout Repository') {
            steps {
                // Clone the GitHub repo (uses the Jenkins built-in 'git' step)
                git url: 'https://github.com/F21AO-Group5/Devops-Group5.git', branch: 'main'
            }
        }

        stage('Build Docker Images') {
            steps {
                // Build each service's Docker image and tag with Jenkins build number
                sh 'docker build -t $DOCKERHUB_ACCOUNT/user-service:$BUILD_NUMBER ./user-service'
                sh 'docker build -t $DOCKERHUB_ACCOUNT/patient-service:$BUILD_NUMBER ./patient-service'
                sh 'docker build -t $DOCKERHUB_ACCOUNT/referral-service:$BUILD_NUMBER ./referral-service'
                sh 'docker build -t $DOCKERHUB_ACCOUNT/lab-service:$BUILD_NUMBER ./lab-service'
            }
        }

        stage('Docker Hub Login') {
            steps {
                // Use Jenkins credentials for Docker Hub login (usernamePassword type)
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-id',       
                    usernameVariable: 'DOCKERHUB_USER',   
                    passwordVariable: 'DOCKERHUB_PASS'    
                )]) {
                    // Docker login using credentials (password will be masked in output)
                    sh 'docker login -u $DOCKERHUB_USER -p $DOCKERHUB_PASS'
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                // Push all service images to Docker Hub (uses the tags from build stage)
                sh 'docker push $DOCKERHUB_ACCOUNT/user-service:$BUILD_NUMBER'
                sh 'docker push $DOCKERHUB_ACCOUNT/patient-service:$BUILD_NUMBER'
                sh 'docker push $DOCKERHUB_ACCOUNT/referral-service:$BUILD_NUMBER'
                sh 'docker push $DOCKERHUB_ACCOUNT/lab-service:$BUILD_NUMBER'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                // Deploy all containers using docker-compose
                // (Ensure docker-compose.yml is configured to use the above image tags)
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        failure {
            echo "Build failed! Please check the logs."
        }
        success {
            echo "Build and deployment successful."
        }
    }
}
