import knex from '../../knex';

export default async function handler(req, res) {
  const candidates = await knex('candidate')
    .select({
      candidate_id: 'candidate.id',
      candidate_name: 'candidate.name',
      contest_id: 'candidate.contest_id',
      contest_name: 'contest.name',
    })
    .count({ votes: 'vote.id' })
    .join('contest', 'contest.id', '=', 'candidate.contest_id')
    .join('vote', 'vote.candidate_id', '=', 'candidate.id')
    .groupBy('candidate.id');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');

  const response = {};
  for (const candidate of candidates) {
    if (response[candidate.contest_id]) {
      response[candidate.contest_id].push(candidate);
    } else {
      response[candidate.contest_id] = [candidate];
    }
  }
  res.end(JSON.stringify(response));
}
