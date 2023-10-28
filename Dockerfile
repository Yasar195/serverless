FROM node:18
WORKDIR /app
COPY package.json /app
COPY . /app
EXPOSE 8080
CMD ["npm", "start"]