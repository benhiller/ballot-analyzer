import db, { knex } from 'src/db';
import cache from 'src/cache';

const cacheGetScb = async (key, cb) => {
  const cachedValue = await cache.get(key);
  if (cachedValue) {
    return cachedValue;
  }

  const result = await cb();
  await cache.set(key, result, 86400);
  return result;
};

async function getAllCandidates() {
  return cacheGetScb('all-candidates', async () => {
    const candidates = await db.query(
      knex('candidate')
        .select({
          election_id: 'candidate.election_id',
          candidate_id: 'candidate.id',
          candidate_name: 'candidate.name',
          contest_id: 'candidate.contest_id',
          contest_name: 'contest.name',
          contest_num_votes: 'contest.num_votes',
        })
        .join('contest', 'contest.id', '=', 'candidate.contest_id')
        .groupBy('candidate.id', 'contest.id')
        .toString(),
    );

    return candidates.rows.map((candidate) => ({
      id: candidate.candidate_id.toString(),
      name: candidate.candidate_name,
      electionId: candidate.election_id.toString(),
      contest: {
        id: candidate.contest_id.toString(),
        name: candidate.contest_name,
        numVotes: candidate.contest_num_votes,
      },
    }));
  });
}

async function getAllElections() {
  return cacheGetScb('all-elections', async () => {
    const elections = await db.query(
      knex('election')
        .select({
          election_id: 'election.id',
          election_name: 'election.name',
          election_date: 'election.date',
        })
        .orderBy('date', 'desc')
        .toString(),
    );

    return elections.rows.map((election) => ({
      id: election.election_id.toString(),
      name: election.election_name,
      date: election.election_date,
    }));
  });
}

async function getAllCountingGroups() {
  return cacheGetScb('all-groups', async () => {
    const groups = await db.query(
      knex('counting_group')
        .select({
          election_id: 'counting_group.election_id',
          group_id: 'counting_group.id',
          group_name: 'counting_group.name',
        })
        .orderBy('id', 'asc')
        .toString(),
    );

    return groups.rows.map((group) => ({
      id: group.group_id.toString(),
      name: group.group_name,
      electionId: group.election_id.toString(),
    }));
  });
}

async function getAllDistricts() {
  return cacheGetScb('all-districts', async () => {
    const districts = await db.query(
      knex('district')
        .select({
          election_id: 'district.election_id',
          district_id: 'district.id',
          district_name: 'district.name',
          district_type_name: 'district_type.name',
        })
        .join(
          'district_type',
          'district_type.id',
          '=',
          'district.district_type_id',
        )
        .orderBy('district.id', 'asc')
        .toString(),
    );

    return districts.rows.map((district) => ({
      id: district.district_id.toString(),
      name: district.district_name,
      type: district.district_type_name,
      electionId: district.election_id.toString(),
    }));
  });
}

export async function getFilterPayload() {
  const [candidates, elections, countingGroups, districts] = await Promise.all([
    getAllCandidates(),
    getAllElections(),
    getAllCountingGroups(),
    getAllDistricts(),
  ]);
  return { candidates, elections, countingGroups, districts };
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

  if (query.countingGroup) {
    votesQuery = votesQuery.where({ counting_group_id: query.countingGroup });
  }

  if (query.district) {
    votesQuery = votesQuery.whereExists(
      knex
        .select('id')
        .from('precinct_portion_district_assoc')
        .whereRaw(
          'vote.precinct_portion_id = precinct_portion_district_assoc.precinct_portion_id AND precinct_portion_district_assoc.district_id = ?',
          [query.district],
        ),
    );
  }

  let contestsToVotes = {};
  if (query.candidate) {
    const distinctVotes = await cacheGetScb(
      `distinct-votes-${query.candidate}`,
      async () => {
        return await db.query(
          knex
            .count()
            .select('contest_id')
            .from(
              applyCandidateFilter(
                knex('vote')
                  .distinct(['tabulator_id', 'batch_id', 'record_id'])
                  .select('contest_id')
                  .where('election_id', electionId),
                query.candidate,
              ).as('distinct_votes'),
            )
            .groupBy('contest_id')
            .toString(),
        );
      },
    );
    contestsToVotes = Object.fromEntries(
      distinctVotes.rows.map((row) => [
        row.contest_id.toString(),
        parseInt(row.count),
      ]),
    );
  }

  let key = 'votes-by-candidate';
  if (query.candidate) {
    key = `${key}-c${query.candidate}`;
  }
  if (query.countingGroup) {
    key = `${key}-g${query.countingGroup}`;
  }
  if (query.district) {
    key = `${key}-d${query.district}`;
  }

  const votesByCandidateResults = await cacheGetScb(key, async () => {
    return db.query(votesQuery.toString());
  });
  const votesByCandidate = votesByCandidateResults.rows;
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
        distinctVotes: contestsToVotes[candidate.contest.id] || null,
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
