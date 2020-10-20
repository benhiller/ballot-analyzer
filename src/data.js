import knex from 'src/knex';

export async function getCandidates() {
  const candidates = await knex('candidate')
    .select({
      candidate_id: 'candidate.id',
      candidate_name: 'candidate.name',
      contest_id: 'candidate.contest_id',
      contest_name: 'contest.name',
    })
    .join('contest', 'contest.id', '=', 'candidate.contest_id')
    .groupBy('candidate.id', 'contest.id');

  return candidates;
}

export async function getVotes(query) {
  let votesQuery = knex('vote')
    .select({
      candidate_id: 'candidate_id',
    })
    .count()
    .groupBy('candidate_id');

  if (query.candidate) {
    votesQuery = votesQuery.whereExists(
      knex
        .select('id')
        .from('vote AS inner_vote')
        .whereRaw(
          'vote.tabulator_id = inner_vote.tabulator_id AND vote.batch_id = inner_vote.batch_id AND vote.record_id = inner_vote.record_id AND inner_vote.candidate_id = ?',
          [query.candidate],
        ),
    );
  }

  const votesByCandidate = await votesQuery;

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

  const contestToCandidateMap = {};
  for (const candidate of candidates) {
    const finalCandidate = {
      id: candidate.candidate_id,
      name: candidate.candidate_name,
      votes: candidate.votes,
    };
    if (contestToCandidateMap[candidate.contest_id]) {
      contestToCandidateMap[candidate.contest_id].candidates.push(
        finalCandidate,
      );
    } else {
      contestToCandidateMap[candidate.contest_id] = {
        id: candidate.contest_id,
        name: candidate.contest_name,
        candidates: [finalCandidate],
      };
    }
  }

  return Object.values(contestToCandidateMap).filter(
    (contest) =>
      contest.candidates.reduce((acc, candidate) => acc + candidate.votes, 0) >
      0,
  );
}
