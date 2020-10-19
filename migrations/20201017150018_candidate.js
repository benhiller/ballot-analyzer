exports.up = function (knex) {
  return knex.schema
    .createTable('election', function (table) {
      table.increments('id');
      table.string('cvr_id');
      table.string('name');
      table.string('date');
      table.unique(['date']);
    })
    .createTable('contest', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');
      table.integer('num_votes');
      table.integer('num_ranks');

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('candidate', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');
      table.integer('contest_id').unsigned().notNullable();

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'cvr_id']);

      table.foreign('contest_id').references('id').inTable('contest');
      table.index('contest_id');
    })
    .createTable('ballot_type', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('counting_group', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('party', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('precinct_portion', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('ballot_type_contest_assoc', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.integer('ballot_type_id').unsigned().notNullable();
      table.integer('contest_id').unsigned().notNullable();

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'ballot_type_id', 'contest_id']);

      table.foreign('ballot_type_id').references('id').inTable('ballot_type');
      table.index('ballot_type_id');

      table.foreign('contest_id').references('id').inTable('contest');
      table.index('contest_id');
    })
    .createTable('district_type', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('district', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');
      table.integer('district_type_id').unsigned().notNullable();

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'cvr_id']);

      table
        .foreign('district_type_id')
        .references('id')
        .inTable('district_type');
      table.index('district_type_id');
    })
    .createTable('precinct_portion_district_assoc', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.integer('precinct_portion_id').unsigned().notNullable();
      table.integer('district_id').unsigned().notNullable();

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');
      table.unique(['election_id', 'precinct_portion_id', 'district_id']);

      table
        .foreign('precinct_portion_id')
        .references('id')
        .inTable('precinct_portion');
      table.index('precinct_portion_id');

      table.foreign('district_id').references('id').inTable('district');
      table.index('district_id');
    })
    .createTable('vote', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
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

      table.foreign('election_id').references('id').inTable('election');
      table.index('election_id');

      table
        .foreign('precinct_portion_id')
        .references('id')
        .inTable('precinct_portion');
      table.index('precinct_portion_id');

      table.foreign('ballot_type_id').references('id').inTable('ballot_type');
      table.index('ballot_type_id');

      table.foreign('contest_id').references('id').inTable('contest');
      table.index('contest_id');

      table.foreign('candidate_id').references('id').inTable('candidate');
      table.index('candidate_id');

      table.foreign('party_id').references('id').inTable('party');
      table.index('party_id');

      table
        .foreign('counting_group_id')
        .references('id')
        .inTable('counting_group');
      table.index('counting_group_id');
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
    .dropTable('contest')
    .dropTable('election');
};
