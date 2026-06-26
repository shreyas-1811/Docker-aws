FROM node:20-alpine        //This will use the node:20-alpine image as the base image for the container

COPY . /backend .  //This will copy all the files from the current directory to the /backend directory in the container

CMD ["node", "server.js"]  //This will run the server.js file when the container is started