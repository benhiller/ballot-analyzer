import { getContestResults } from 'src/data';
import db from 'src/db/';

export default async function handler(req, res) {
  await db.connect();
  const response = await getContestResults(req.query);
  await db.clean();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(response);
}
