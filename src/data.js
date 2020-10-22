import knex from 'src/knex';

export async function getAllCandidates() {
  const candidates = await knex('candidate')
    .select({
      election_id: 'candidate.election_id',
      candidate_id: 'candidate.id',
      candidate_name: 'candidate.name',
      contest_id: 'candidate.contest_id',
      contest_name: 'contest.name',
    })
    .join('contest', 'contest.id', '=', 'candidate.contest_id')
    .groupBy('candidate.id', 'contest.id');

  return candidates.map((candidate) => ({
    id: candidate.candidate_id.toString(),
    name: candidate.candidate_name,
    electionId: candidate.election_id.toString(),
    contest: {
      id: candidate.contest_id.toString(),
      name: candidate.contest_name,
    },
  }));
}

export async function getAllElections() {
  const elections = await knex('election')
    .select({
      election_id: 'election.id',
      election_name: 'election.name',
      election_date: 'election.date',
    })
    .orderBy('id', 'asc');

  return elections.map((election) => ({
    id: election.election_id.toString(),
    name: election.election_name,
    date: election.election_date,
  }));
}

export async function getFilterPayload() {
  const candidates = await getAllCandidates();
  const elections = await getAllElections();
  return { candidates, elections };
}

export async function getContestResults(query) {
  const allCandidates = await getAllCandidates();
  let electionId = query.election;
  if (!electionId) {
    const elections = await getAllElections();
    electionId = elections[0].id;
  }

  let votesQuery = knex('vote')
    .select({
      candidate_id: 'candidate_id',
    })
    .count()
    .where('election_id', electionId)
    .groupBy('candidate_id');

  const applyCandidateFilter = (query, candidateId) => {
    return query.whereExists(
      knex
        .select('id')
        .from('vote AS inner_vote')
        .whereRaw(
          'vote.tabulator_id = inner_vote.tabulator_id AND vote.batch_id = inner_vote.batch_id AND vote.record_id = inner_vote.record_id AND inner_vote.candidate_id = ?',
          [candidateId],
        ),
    );
  };

  if (query.candidate) {
    votesQuery = applyCandidateFilter(votesQuery, query.candidate);
  }

  let contestsToVotes = {};
  if (query.candidate) {
    const distinctVotes = await applyCandidateFilter(
      knex('vote')
        .count(knex.raw('DISTINCT(tabulator_id, batch_id, record_id)'), {
          as: 'distinct_votes',
        })
        .select('contest_id')
        .where('election_id', electionId)
        .groupBy('contest_id'),
      query.candidate,
    );
    contestsToVotes = Object.fromEntries(
      distinctVotes.map((row) => [
        row.contest_id.toString(),
        parseInt(row.count),
      ]),
    );
  }

  const votesByCandidate = await votesQuery;
  const candidateToVotes = Object.fromEntries(
    votesByCandidate.map((row) => [
      row.candidate_id.toString(),
      parseInt(row.count),
    ]),
  );

  const contestToCandidateMap = {};
  for (const candidate of allCandidates) {
    const finalCandidate = {
      id: candidate.id,
      name: candidate.name,
      votes: candidateToVotes[candidate.id] || 0,
    };
    if (contestToCandidateMap[candidate.contest.id]) {
      contestToCandidateMap[candidate.contest.id].candidates.push(
        finalCandidate,
      );
    } else {
      contestToCandidateMap[candidate.contest.id] = {
        ...candidate.contest,
        distinctVotes: contestsToVotes[candidate.contest.id],
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
