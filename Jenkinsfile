pipeline {
    agent none

    stages {
        stage('Build') {
            agent { 
                docker { 
                    image 'docker:20.10.16' 
                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock' 
                } 
            }
            steps {
                sh 'docker build -t my-app:latest .'

                jiraSendBuildInfo()  
            }
        }

        stage('Push Image') {
            agent { 
                docker { 
                    image 'docker:20.10.16' 

                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock' 
                } 
            }
            steps {
                // Use Jenkins credentials for Docker Hub login instead of raw environment variables
                withCredentials([usernamePassword(credentialsId: 'docker-hub-cred-id', usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKER_HUB_PASS')]) {
                    // Log in to Docker Hub using credentials (credentials are masked in logs)
                    sh 'docker login -u $ak2267 -p $Mahin@2718$'
                    // Push the Docker image to Docker Hub
                    sh 'docker push my-app:latest'
                }
            }
        }

        stage('Deploy to Dev') {
            agent { 
                docker { 
                    image 'docker:20.10.16' 
                    // Run as root and mount Docker socket so we can use Docker/Compose on the host Docker daemon
                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock' 
                } 
            }
            steps {
                // Ensure Docker Compose is available in the Docker agent container
                // (The official docker:20.10.16 image may not include Docker Compose by default)
                sh '''
                   if ! docker compose version >/dev/null 2>&1 && ! docker-compose --version >/dev/null 2>&1; then
                       echo "Docker Compose not found in container, installing it..."
                       apt-get update && apt-get install -y docker-compose
                   fi
                '''

                // Use Docker Compose to deploy the application (e.g., start services)
                sh 'docker-compose up -d'  // or 'docker compose up -d' if using Docker Compose v2 plugin

                // Send deployment info to Jira, indicating this stage as a deployment event
                jiraSendDeploymentInfo(environmentId: 'dev-env-001', environmentName: 'Development', environmentType: 'development')
                // ^ environmentId/Name/Type should be adjusted to match your environment details (e.g., Dev, Staging, Prod)
            }
        }
    }
}
