FROM node:20-alpine

EXPOSE 3000/tcp
COPY . ./
RUN npm install
ENTRYPOINT ["npm", "run", "dev"]
