import knex from 'src/knex';

export async function getCandidates() {
  return await knex('candidate')
    .select({
      candidate_id: 'candidate.id',
      candidate_name: 'candidate.name',
      contest_id: 'candidate.contest_id',
      contest_name: 'contest.name',
    })
    .join('contest', 'contest.id', '=', 'candidate.contest_id')
    .groupBy('candidate.id', 'contest.id');
}

export async function getPayload(query) {
  const allCandidates = await getCandidates();

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
  const candidateToVotes = Object.fromEntries(
    votesByCandidate.map((row) => [row.candidate_id, parseInt(row.count)]),
  );

  const contestToCandidateMap = {};
  for (const candidate of allCandidates) {
    const finalCandidate = {
      id: candidate.candidate_id,
      name: candidate.candidate_name,
      votes: candidateToVotes[candidate.candidate_id] || 0,
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

  const contestResults = Object.values(contestToCandidateMap).filter(
    (contest) =>
      contest.candidates.reduce((acc, candidate) => acc + candidate.votes, 0) >
      0,
  );

  return {
    allCandidates,
    contestResults,
  };
}
