# using Node.js image as the base image
FROM node:18
 
# working directory setup
WORKDIR /usr/src/app
 
# Copying package.json and package-lock.json
COPY package*.json ./
 
# Dependencies installations
RUN npm install
 
# Copy application code
COPY . .
 
# Expose the port the app runs on
EXPOSE 3003
 
# Command to run the application
CMD ["node", "index.js"]