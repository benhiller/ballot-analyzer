import memjs from 'memjs';

let cache;
if (process.env.MC_CONNECTION_STRING) {
  cache = memjs.Client.create(process.env.MC_CONNECTION_STRING);
} else {
  cache = null;
}

export default cache;
