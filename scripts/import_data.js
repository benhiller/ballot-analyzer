require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { attachOnConflictDoNothing } = require('knex-on-conflict-do-nothing');

const knex = require('../knex.js');

attachOnConflictDoNothing();

const dir = path.resolve(process.argv[2]);

const CHUNK_SIZE = 500;
let electionId = null;

const importManifest = async (
  fileName,
  tableName,
  itemToRow,
  returnIdMap = true,
) => {
  const manifestPath = path.join(dir, fileName);
  const data = await fs.promises.readFile(manifestPath, 'utf8');
  const parsedData = JSON.parse(data);
  const rows = [];
  for (const item of parsedData.List) {
    const row = itemToRow(item);
    if (electionId) {
      row.election_id = electionId;
    }
    rows.push(row);
  }

  do {
    const rowsToInsert = rows.splice(0, CHUNK_SIZE);
    await knex.insert(rowsToInsert).into(tableName).onConflictDoNothing();
  } while (rows.length > 0);

  if (returnIdMap) {
    const idMap = await knex(tableName).select('id', 'cvr_id');
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
    (item) => ({
      ballot_type_id: ballotTypeIdMap[item.BallotTypeId],
      contest_id: contestIdMap[item.ContestId],
    }),
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

  const files = await fs.promises.readdir(dir);
  const fileCount = files.length;
  let filesProcessed = 0;
  for (const file of files) {
    if (!file.startsWith('CvrExport_')) {
      continue;
    }

    const manifestPath = path.join(dir, file);
    const data = await fs.promises.readFile(manifestPath, 'utf8');
    const parsedData = JSON.parse(data);

    const rows = [];
    for (const item of parsedData.Sessions) {
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

      for (const card of vote.Cards) {
        for (const contest of card.Contests) {
          for (const mark of contest.Marks) {
            if (mark.IsVote) {
              rows.push({
                ...rowTemplate,
                contest_id: contestIdMap[contest.Id],
                candidate_id: candidateIdMap[mark.CandidateId],
                // TODO: PartyId is undefined for write-ins, maybe change this check
                party_id: mark.PartyId !== 0 ? partyIdMap[mark.PartyId] : null,
                rank: mark.Rank,
              });
            }
          }
        }
      }
    }

    do {
      const rowsToInsert = rows.splice(0, CHUNK_SIZE);
      await knex.insert(rowsToInsert).into('vote');
    } while (rows.length > 0);

    filesProcessed += 1;
    console.log(`${filesProcessed} of ${fileCount} files processed`);
  }
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
