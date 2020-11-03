import Memcached from 'memcached-promisify';

let cache;
if (process.env.MC_CONNECTION_STRING) {
  cache = new Memcached(process.env.MC_CONNECTION_STRING);
} else {
  cache = null;
}

export default cache;
