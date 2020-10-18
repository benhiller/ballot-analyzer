import knex from '../../knex';

export default async function handler(req, res) {
  const candidates = await knex('candidate').select('id', 'name');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(candidates));
}
