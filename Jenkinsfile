pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning repository...'
                git branch: 'main', url: 'https://github.com/F21AO-Group5/Devops-Group5.git'
            }
        }

        stage('Build') {
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
            steps {
                echo 'Building Docker images...'
                sh 'docker build -t user-service ./user-service'
                sh 'docker build -t patient-service ./patient-service'
                sh 'docker build -t referral-service ./referral-service'
                sh 'docker build -t lab-service ./lab-service'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing images to Docker Hub...'
                sh 'docker login -u $ak2267 -p $Mahin@2718$'
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
