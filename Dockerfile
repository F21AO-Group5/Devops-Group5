# Use official Jenkins LTS base image
FROM jenkins/jenkins:lts

# Switch to root to install Docker CLI and modify groups
USER root

# Install Docker CLI (using Docker's convenience script)
RUN apt-get update && apt-get install -y curl \
 && curl -fsSL https://get.docker.com/ | sh

# Add the Jenkins user to the "docker" group
RUN usermod -aG docker jenkins

# Revert to the Jenkins user to run the Jenkins service
USER jenkins
