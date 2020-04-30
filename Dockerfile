FROM node:13-alpine

ENV DISCORD_TOKEN CHANGEME
ENV POSTGRES_URL CHANGEME

#Create the directory
RUN mkdir -p /usr/src/auto-voice
WORKDIR /usr/src/auto-voice

#Copy and install the bot
COPY package.json /usr/src/auto-voice
RUN npm install

#Now this is the bot
COPY . /usr/src/auto-voice

#Start the bot!
CMD ["npm", "start"]