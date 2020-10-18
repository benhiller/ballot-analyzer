
exports.up = function (knex) {
  return knex.schema.createTable('contest', function (table) {
    table.increments('id');
    table.string('cvr_id');
    table.string('name');
    table.integer('num_votes');
    table.integer('num_ranks');
  }).createTable('candidate', function (table) {
    table.increments('id');
    table.string('cvr_id');
    table.string('name');
    table.integer('contest_id').unsigned().notNullable();

    table.foreign('contest_id').references('id').inTable('contest');
  }).createTable('ballot_type', function (table) {
    table.increments('id');
    table.string('cvr_id');
    table.string('name');
  }).createTable('counting_group', function (table) {
    table.increments('id');
    table.string('cvr_id');
    table.string('name');
  }).createTable('party', function (table) {
    table.increments('id');
    table.string('cvr_id');
    table.string('name');
  }).createTable('precinct_portion', function (table) {
    table.increments('id');
    table.string('cvr_id');
    table.string('name');
  }).createTable('ballot_type_contest_assoc', function (table) {
    table.increments('id');
    table.integer('ballot_type_id').unsigned().notNullable();
    table.integer('contest_id').unsigned().notNullable();

    table.foreign('ballot_type_id').references('id').inTable('ballot_type');
    table.foreign('contest_id').references('id').inTable('contest');
  }).createTable('district_type', function (table) {
    table.increments('id');
    table.string('cvr_id');
    table.string('name');
  }).createTable('district', function (table) {
    table.increments('id');
    table.string('cvr_id');
    table.string('name');
    table.integer('district_type_id').unsigned().notNullable();

    table.foreign('district_type_id').references('id').inTable('district_type');
  }).createTable('precinct_portion_district_assoc', function (table) {
    table.increments('id');
    table.integer('precinct_portion_id').unsigned().notNullable();
    table.integer('district_id').unsigned().notNullable();

    table.foreign('precinct_portion_id').references('id').inTable('precinct_portion');
    table.foreign('district_id').references('id').inTable('district');
  }).createTable('vote', function (table) {
    table.increments('id');
    table.integer('tabulator_id').notNullable();
    table.integer('batch_id').notNullable();
    table.integer('record_id').notNullable();
    table.integer('precinct_portion_id').unsigned().notNullable();
    table.integer('ballot_type_id').unsigned().notNullable();
    table.integer('contest_id').unsigned().notNullable();
    table.integer('candidate_id').unsigned().notNullable();
    table.integer('party_id').unsigned();
    table.integer('counting_group_id').unsigned().notNullable();
    table.integer('rank');

    table.foreign('precinct_portion_id').references('id').inTable('precinct_portion');
    table.foreign('ballot_type_id').references('id').inTable('ballot_type');
    table.foreign('contest_id').references('id').inTable('contest');
    table.foreign('candidate_id').references('id').inTable('candidate');
    table.foreign('party_id').references('id').inTable('party');
    table.foreign('counting_group_id').references('id').inTable('counting_group');
  });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('vote')
    .dropTable('precinct_portion_district_assoc')
    .dropTable('district')
    .dropTable('district_type')
    .dropTable('ballot_type_contest_assoc')
    .dropTable('precinct_portion')
    .dropTable('party')
    .dropTable('counting_group')
    .dropTable('ballot_type')
    .dropTable('candidate')
    .dropTable('contest');
};
