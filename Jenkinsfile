pipeline {
    agent any

    environment {
        // Docker Hub username (not a secret, just for image tagging)
        DOCKERHUB_ACCOUNT = 'ak2267'  // Your Docker Hub username
        PATH = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"  // Add both possible Docker paths
        DOCKER_HOST = "unix:///Users/adarshkumar/.docker/run/docker.sock"  // Correct Docker socket path
        DOCKER_CONTEXT = "desktop-linux"  // Docker context
        HOME = "/Users/adarshkumar"  // Set home directory
    }

    stages {
        stage('Debug Environment') {
            steps {
                sh '''
                    echo "Current PATH: $PATH"
                    echo "Docker location: $(which docker)"
                    echo "Docker version: $(docker --version)"
                    echo "Docker socket exists: $(test -S /Users/adarshkumar/.docker/run/docker.sock && echo "Yes" || echo "No")"
                    echo "Docker context: $(docker context ls)"
                '''
            }
        }

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

        stage('Docker Test') {
            steps {
                sh 'docker --version'
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-id', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                        docker info
                    '''
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                // Push all service images to Docker Hub with enhanced error handling
                sh '''
                    services=("user-service" "patient-service" "referral-service" "lab-service")
                    for service in "${services[@]}"; do
                        echo "Pushing $DOCKERHUB_ACCOUNT/$service:$BUILD_NUMBER to Docker Hub..."
                        if docker push $DOCKERHUB_ACCOUNT/$service:$BUILD_NUMBER; then
                            echo "Successfully pushed $service image"
                        else
                            echo "Failed to push $service image. Check Docker Hub permissions and connection."
                            exit 1
                        fi
                    done
                '''
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
