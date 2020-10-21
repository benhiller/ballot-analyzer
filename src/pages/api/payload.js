import { getPayload } from 'src/data';

export default async function handler(req, res) {
  const response = await getPayload(req.query);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(response);
}
