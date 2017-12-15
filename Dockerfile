FROM node:carbon
ENV HOME=/usr/src/app
ENV HOME_FRONTEND=/usr/src/app/client


# Create app directory
WORKDIR $HOME

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
