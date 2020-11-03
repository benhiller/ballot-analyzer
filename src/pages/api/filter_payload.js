import { getFilterPayload } from 'src/data';

export default async function handler(req, res) {
  const payload = await getFilterPayload();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(payload);
}
