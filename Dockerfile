# Base image
FROM node:19

# Tell Puppeteer to skip installing Chrome, we'll be using the browserless/chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create app directory
WORKDIR /usr/src/app

# Copy both package.json AND yarn.lock
COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn run build

# Set default environment to production
ENV NODE_ENV=production

# Start the server using the production build
CMD [ "yarn", "run", "start:prod" ]
