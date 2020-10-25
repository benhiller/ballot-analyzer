exports.up = function (knex) {
  return knex.schema.table('vote', function (table) {
    table.index(
      ['election_id', 'tabulator_id', 'batch_id', 'record_id', 'contest_id'],
      'vote_distinct_ballot_index',
    );
  });
};

exports.down = function (knex) {
  return knex.schema.table('vote', function (table) {
    table.dropIndex(
      ['election_id', 'tabulator_id', 'batch_id', 'record_id', 'contest_id'],
      'vote_distinct_ballot_index',
    );
  });
};
