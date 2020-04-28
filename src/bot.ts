import Client from "./struct/SporkVoiceClient";
import config from './config.js';
const client = new Client();
try {
  client.login(config.token);
} catch (e) {
  client.logger.stacktrace(e)
}

export default client;