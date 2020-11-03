import Memcached from 'memcached-promisify';

const cache = new Memcached(process.env.MC_CONNECTION_STRING);

export default cache;
