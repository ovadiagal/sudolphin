# Use official Node.js 20 image as base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 8080 to match App Engine's requirement
EXPOSE 8080

# Start the Next.js application
CMD ["npm", "start"]
