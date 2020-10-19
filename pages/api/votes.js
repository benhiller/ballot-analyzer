import getVotes from '../../votes';

export default async function handler(req, res) {
  const response = await getVotes(req.query);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(response);
}
