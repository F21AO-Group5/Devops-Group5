pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                // Build Docker image on the host
                sh "docker build -t mycompany/myapp:${env.BUILD_NUMBER} ."
                jiraSendBuildInfo()
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ak2267', usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKER_HUB_PASS')]) {
                    sh "docker login -u ${env.DOCKER_HUB_USER} -p ${env.DOCKER_HUB_PASS}"
                    sh "docker push mycompany/myapp:${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy Services') {
            steps {
                sh 'docker-compose up -d'
                jiraSendDeploymentInfo()
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
