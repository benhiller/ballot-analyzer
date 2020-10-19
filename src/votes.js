import knex from 'src/knex';

export default async function getVotes(query) {
  const votesByCandidate = await knex('vote')
    .select({
      candidate_id: 'candidate_id',
    })
    .count()
    .groupBy('candidate_id');

  const candidateToVotes = {};
  for (const row of votesByCandidate) {
    candidateToVotes[row.candidate_id] = parseInt(row.count);
  }

  const candidates = await knex('candidate')
    .select({
      candidate_id: 'candidate.id',
      candidate_name: 'candidate.name',
      contest_id: 'candidate.contest_id',
      contest_name: 'contest.name',
    })
    .join('contest', 'contest.id', '=', 'candidate.contest_id')
    .groupBy('candidate.id', 'contest.id');

  for (const candidate of candidates) {
    candidate.votes = candidateToVotes[candidate.candidate_id] || 0;
  }

  const response = {};
  for (const candidate of candidates) {
    if (response[candidate.contest_id]) {
      response[candidate.contest_id].push(candidate);
    } else {
      response[candidate.contest_id] = [candidate];
    }
  }

  return response;
}
