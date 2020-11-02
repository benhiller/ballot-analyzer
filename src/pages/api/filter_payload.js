import { getFilterPayload } from 'src/data';
import db from 'src/db/';

export default async function handler(req, res) {
  await db.connect();
  const payload = await getFilterPayload();
  await db.clean();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(payload);
}
