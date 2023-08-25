FROM node:latest
COPY package.json /
RUN npm install
COPY . /
WORKDIR  /
CMD ["npm", "start"]