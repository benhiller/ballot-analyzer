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
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('candidate', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');
      table.integer('contest_id').unsigned().notNullable();

      table.foreign('election_id').references('id').inTable('election');
      table.foreign('contest_id').references('id').inTable('contest');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('ballot_type', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('counting_group', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('party', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('precinct_portion', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
    })
    .createTable('ballot_type_contest_assoc', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.integer('ballot_type_id').unsigned().notNullable();
      table.integer('contest_id').unsigned().notNullable();

      table.foreign('election_id').references('id').inTable('election');
      table.foreign('ballot_type_id').references('id').inTable('ballot_type');
      table.foreign('contest_id').references('id').inTable('contest');
      table.unique(['election_id', 'ballot_type_id', 'contest_id']);
    })
    .createTable('district_type', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');

      table.foreign('election_id').references('id').inTable('election');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('district', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.string('cvr_id');
      table.string('name');
      table.integer('district_type_id').unsigned().notNullable();

      table
        .foreign('district_type_id')
        .references('id')
        .inTable('district_type');
      table.unique(['election_id', 'cvr_id']);
    })
    .createTable('precinct_portion_district_assoc', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.integer('precinct_portion_id').unsigned().notNullable();
      table.integer('district_id').unsigned().notNullable();

      table.foreign('election_id').references('id').inTable('election');
      table
        .foreign('precinct_portion_id')
        .references('id')
        .inTable('precinct_portion');
      table.foreign('district_id').references('id').inTable('district');
      table.unique(['election_id', 'precinct_portion_id', 'district_id']);
    })
    .createTable('ballot', function (table) {
      table.increments('id');
      table.integer('election_id').unsigned().notNullable();
      table.integer('tabulator_id').notNullable();
      table.integer('batch_id').notNullable();
      table.integer('record_id').notNullable();
      table.integer('precinct_portion_id').unsigned().notNullable();
      table.integer('ballot_type_id').unsigned().notNullable();
      table.integer('counting_group_id').unsigned().notNullable();
      table.jsonb('votes');

      table.foreign('election_id').references('id').inTable('election');
      table
        .foreign('precinct_portion_id')
        .references('id')
        .inTable('precinct_portion');
      table.foreign('ballot_type_id').references('id').inTable('ballot_type');
      table
        .foreign('counting_group_id')
        .references('id')
        .inTable('counting_group');
      table.unique(['election_id', 'tabulator_id', 'batch_id', 'record_id']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('ballot')
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
