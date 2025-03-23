// Jenkinsfile - Revised to run on Jenkins host without per-stage Docker agents
pipeline {
    // Use any available Jenkins agent (no per-stage Docker container agents needed)
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the repository (previously ran in a Docker agent; now runs on Jenkins host)
                checkout scm
            }
        }

        stage('Build') {
            steps {
                // Build the Docker image on the Jenkins host using the Docker CLI.
                // (Replace "mycompany/myapp" with your actual Docker image name/path)
                sh "docker build -t mycompany/myapp:${env.BUILD_NUMBER} ."
                // Send build info to Jira (Jira integration step retained from original pipeline)
                jiraSendBuildInfo()
            }
        }

        stage('Push to Docker Hub') {
            steps {
                // Use Jenkins credentials to securely log in to Docker Hub
                // (Ensure 'docker-hub-creds' is the ID of your Jenkins credentials for Docker Hub credentials)
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'ak2267', passwordVariable: 'Mahin@2718$')]) {
                    // Log in to Docker Hub using the credentials provided by Jenkins
                    sh "docker login -u ${env.DOCKERHUB_USER} -p ${env.DOCKERHUB_PASS}"
                    // Push the Docker image to Docker Hub
                    sh "docker push mycompany/myapp:${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy Services') {
            steps {
                // Deploy services using Docker Compose on the Jenkins host
                sh 'docker-compose up -d'
                // Send deployment info to Jira (Jira integration step retained)
                jiraSendDeploymentInfo()
            }
        }
    }
}
