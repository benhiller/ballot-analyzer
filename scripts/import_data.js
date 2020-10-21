require('dotenv').config();

const fs = require('fs');
const es = require('event-stream');
const JSONStream = require('JSONStream');
const path = require('path');
const { attachOnConflictDoNothing } = require('knex-on-conflict-do-nothing');

const knex = require('../src/knex.js');

attachOnConflictDoNothing();

const dir = path.resolve(process.argv[2]);

// TODO: Is chunking at all useful?
const CHUNK_SIZE = 500;
let electionId = null;

const importManifest = async (
  fileName,
  tableName,
  itemToRow,
  returnIdMap = true,
) => {
  console.log(`Importing ${fileName}`);
  const manifestPath = path.join(dir, fileName);
  let data;
  try {
    data = await fs.promises.readFile(manifestPath, 'utf8');
  } catch (err) {
    console.log(`Couldn't read file ${fileName}`);
    return {};
  }
  const parsedData = JSON.parse(data);
  const rows = [];
  for (const item of parsedData.List) {
    const row = itemToRow(item);
    if (!row) {
      continue;
    }
    if (electionId) {
      row.election_id = electionId;
    }
    rows.push(row);
  }

  const allRows = [...rows];
  while (rows.length > 0) {
    const rowsToInsert = rows.splice(0, CHUNK_SIZE);
    await knex.insert(rowsToInsert).into(tableName).onConflictDoNothing();
  }

  if (returnIdMap) {
    if (allRows.length === 0) {
      return {};
    }
    const idQuery = knex(tableName).select('id', 'cvr_id');
    for (const col of Object.keys(allRows[0])) {
      const values = allRows.map((row) => row[col]);
      idQuery.whereIn(col, values);
    }

    const idMap = await idQuery;
    return Object.fromEntries(
      idMap.map(({ id, cvr_id: cvrId }) => [cvrId, id]),
    );
  }
};

const importElection = async () => {
  const idMap = await importManifest(
    'ElectionEventManifest.json',
    'election',
    (item) => ({
      cvr_id: item.Id,
      name: item.Description,
      date: item.ElectionDate,
    }),
  );

  return idMap[Object.keys(idMap)[0]];
};

const importBallotTypes = async () => {
  return importManifest('BallotTypeManifest.json', 'ballot_type', (item) => ({
    cvr_id: item.Id,
    name: item.Description,
  }));
};

const importCountingGroups = async () => {
  return importManifest(
    'CountingGroupManifest.json',
    'counting_group',
    (item) => ({
      cvr_id: item.Id,
      name: item.Description,
    }),
  );
};

const importParties = async () => {
  return importManifest('PartyManifest.json', 'party', (item) => ({
    cvr_id: item.Id,
    name: item.Description,
  }));
};

const importPrecinctPortions = async () => {
  return importManifest(
    'PrecinctPortionManifest.json',
    'precinct_portion',
    (item) => ({
      cvr_id: item.Id,
      name: item.Description,
    }),
  );
};

const importDistrictTypes = async () => {
  return importManifest(
    'DistrictTypeManifest.json',
    'district_type',
    (item) => ({
      cvr_id: item.Id,
      name: item.Description,
    }),
  );
};

const importDistricts = async (districtTypeIdMap) => {
  return importManifest('DistrictManifest.json', 'district', (item) => ({
    cvr_id: item.Id,
    name: item.Description,
    district_type_id: districtTypeIdMap[item.DistrictTypeId],
  }));
};

const importPrecinctPortionDistrictAssoc = async (
  precinctPortionIdMap,
  districtIdMap,
) => {
  return importManifest(
    'DistrictPrecinctPortionManifest.json',
    'precinct_portion_district_assoc',
    (item) => ({
      precinct_portion_id: precinctPortionIdMap[item.PrecinctPortionId],
      district_id: districtIdMap[item.DistrictId],
    }),
    false,
  );
};

const importBallotTypeContestAssocs = async (ballotTypeIdMap, contestIdMap) => {
  return importManifest(
    'BallotTypeContestManifest.json',
    'ballot_type_contest_assoc',
    (item) => {
      if (!contestIdMap[item.ContestId]) {
        console.log(
          `Invalid contest ID in BallotTypeContestManifest: ${item.ContestId}`,
        );
        return null;
      }

      return {
        ballot_type_id: ballotTypeIdMap[item.BallotTypeId],
        contest_id: contestIdMap[item.ContestId],
      };
    },
    false,
  );
};

const importContests = async () => {
  return importManifest('ContestManifest.json', 'contest', (item) => ({
    cvr_id: item.Id,
    name: item.Description,
    num_votes: item.VoteFor,
    num_ranks: item.NumOfRanks,
  }));
};

const importCandidates = async (contestIdMap) => {
  return importManifest('CandidateManifest.json', 'candidate', (item) => ({
    cvr_id: item.Id,
    name: item.Description,
    contest_id: contestIdMap[item.ContestId],
  }));
};

const importVotes = async (
  precinctPortionIdMap,
  ballotTypeIdMap,
  contestIdMap,
  candidateIdMap,
  partyIdMap,
  countingGroupIdMap,
) => {
  await knex('vote').where('election_id', electionId).del();

  const foreignKeyConstraints = [
    'candidate',
    'counting_group',
    'ballot_type',
    'precinct_portion',
    'election',
  ];
  for (const fk of foreignKeyConstraints) {
    try {
      await knex.raw(`ALTER TABLE vote DROP CONSTRAINT vote_${fk}_id_foreign`);
    } catch (err) {}
  }

  const indexes = [
    'ballot_type_id',
    'candidate_id',
    'counting_group_id',
    'election_id',
    'precinct_portion_id',
  ];
  for (const idx of indexes) {
    try {
      await knex.raw(`DROP INDEX vote_${idx}_index`);
    } catch (err) {}
  }

  const files = await fs.promises.readdir(dir);
  const fileCount = files.length;
  let filesProcessed = 0;
  for (const file of files) {
    if (!file.startsWith('CvrExport')) {
      continue;
    }

    const manifestPath = path.join(dir, file);
    let rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(manifestPath, { encoding: 'utf8' })
        .pipe(JSONStream.parse('Sessions.*'))
        .pipe(
          es.mapSync((item) => {
            const rows = [];

            let vote;
            if (item.Modified && item.Modified.IsCurrent) {
              vote = item.Modified;
            } else if (item.Original && item.Original.IsCurrent) {
              vote = item.Original;
            } else {
              console.log('Uhoh');
            }

            const rowTemplate = {
              election_id: electionId,
              tabulator_id: item.TabulatorId,
              batch_id: item.BatchId,
              record_id: item.RecordId,
              counting_group_id: countingGroupIdMap[item.CountingGroupId],
              ballot_type_id: ballotTypeIdMap[vote.BallotTypeId],
              precinct_portion_id: precinctPortionIdMap[vote.BallotTypeId],
            };

            const processContests = (contests) => {
              for (const contest of contests) {
                for (const mark of contest.Marks) {
                  if (mark.IsVote) {
                    rows.push({
                      ...rowTemplate,
                      candidate_id: candidateIdMap[mark.CandidateId],
                      rank: mark.Rank,
                    });
                  }
                }
              }
            };

            if (vote.Cards) {
              for (const card of vote.Cards) {
                processContests(card.Contests);
              }
            } else {
              processContests(vote.Contests);
            }

            return rows;
          }),
        )
        .pipe(
          es.map(async (newRows, cb) => {
            rows = rows.concat(newRows);
            if (rows.length > CHUNK_SIZE) {
              const rowsToInsert = rows;
              rows = [];
              await knex.insert(rowsToInsert).into('vote');
              cb();
            } else {
              cb();
            }
          }),
        )
        .on('end', () => resolve());
    });

    await knex.insert(rows).into('vote');

    filesProcessed += 1;
    if (filesProcessed % 100 === 0) {
      console.log(`${filesProcessed} of ${fileCount} files processed`);
    }
  }

  for (const fk of foreignKeyConstraints) {
    await knex.raw(
      `ALTER TABLE vote ADD CONSTRAINT vote_${fk}_id_foreign FOREIGN KEY (${fk}_id) REFERENCES ${fk} (id)`,
    );
  }

  for (const idx of indexes) {
    await knex.raw(`CREATE INDEX vote_${idx}_index ON vote (${idx})`);
  }

  await knex.raw('ANALYZE');
};

const importData = async () => {
  electionId = await importElection();
  const ballotTypeIdMap = await importBallotTypes();
  const countingGroupIdMap = await importCountingGroups();
  const partyIdMap = await importParties();
  const precinctPortionIdMap = await importPrecinctPortions();
  const contestIdMap = await importContests();
  const candidateIdMap = await importCandidates(contestIdMap);
  await importBallotTypeContestAssocs(ballotTypeIdMap, contestIdMap);
  const districtTypeIdMap = await importDistrictTypes();
  const districtIdMap = await importDistricts(districtTypeIdMap);
  await importPrecinctPortionDistrictAssoc(precinctPortionIdMap, districtIdMap);

  await importVotes(
    precinctPortionIdMap,
    ballotTypeIdMap,
    contestIdMap,
    candidateIdMap,
    partyIdMap,
    countingGroupIdMap,
  );
};

importData()
  .then(() => {
    knex.destroy();
  })
  .catch((err) => {
    console.error('Import Failed!', err);
    knex.destroy();
  });
