pipeline {
    agent none  // We'll specify agents per stage

    stages {

        stage('Clone Repository') {
            agent any
            steps {
                echo 'Cloning repository...'
                git branch: 'main', url: 'https://github.com/F21AO-Group5/Devops-Group5.git'
            }
        }

        stage('Build') {
            agent any
            steps {
                echo 'Building...'
            }
            post {
                always {
                    jiraSendBuildInfo site: 'f21ao-group5.atlassian.net'
                }
            }
        }

        stage('Deploy - Staging') {
            agent any
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to Staging from main...'
            }
            post {
                always {
                    jiraSendDeploymentInfo(
                        environmentId: 'us-stg-1',
                        environmentName: 'us-stg-1',
                        environmentType: 'staging',
                        site: 'f21ao-group5.atlassian.net'
                    )
                }
            }
        }

        stage('Build Docker Images') {
            // Use a Docker agent that has the docker CLI installed.
            // We use a specific version to ensure consistency.
            agent {
                docker {
                    image 'docker:20.10.16'
                    // Mount the host's Docker socket so commands run against the host's Docker daemon.
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                echo 'Building Docker images...'
                // Optional: show docker version for verification.
                sh 'docker version'
                sh 'docker build -t user-service ./user-service'
                sh 'docker build -t patient-service ./patient-service'
                sh 'docker build -t referral-service ./referral-service'
                sh 'docker build -t lab-service ./lab-service'
            }
        }

        stage('Push to Docker Hub') {
            // Also run this stage in the Docker agent.
            agent {
                docker {
                    image 'docker:20.10.16'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                echo 'Pushing images to Docker Hub...'
                // Replace these plain credentials with Jenkins credentials if possible.
                sh 'docker login -u $DOCKER_HUB_USER -p $DOCKER_HUB_PASS'
                sh 'docker tag user-service $DOCKER_HUB_USER/user-service'
                sh 'docker tag patient-service $DOCKER_HUB_USER/patient-service'
                sh 'docker tag referral-service $DOCKER_HUB_USER/referral-service'
                sh 'docker tag lab-service $DOCKER_HUB_USER/lab-service'
                sh 'docker push $DOCKER_HUB_USER/user-service'
                sh 'docker push $DOCKER_HUB_USER/patient-service'
                sh 'docker push $DOCKER_HUB_USER/referral-service'
                sh 'docker push $DOCKER_HUB_USER/lab-service'
            }
        }

        stage('Deploy Services') {
            // Run docker-compose commands in the Docker agent.
            agent {
                docker {
                    image 'docker:20.10.16'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                echo 'Deploying services...'
                sh 'docker-compose down'
                sh 'docker-compose pull'
                sh 'docker-compose up -d'
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
