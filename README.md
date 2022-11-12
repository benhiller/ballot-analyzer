# SF Ballot Analyzer

This repro contains a Next.js app which shows election results and allows filtering them via several dimensions. The most interesting aspect of this is that it uses the cast vote record to calculate the election results, which allows filtering results by other votes cast in the same election, so you can see how people who voted for candidate A voted in election B, which is not usually something you can do with election results, even when broken down by precinct.

However, there is a major limitation to this, which is that I don't think it is possible to connect different ballot pages cast by the same voter, which means that if you are trying to see how people who voted for candidate A voted in election B, you might not be able to see that if those contests were on separate ballot pages in the election.

You can obtain the cast vote records for SF elections [here](https://sfelections.sfgov.org/results). They are only available for elections post-Nov. 2019, probably because SF switched to new voting machines in that election.

This repo also contains a script to import the cast vote records into a DB, and a script to generate a district precinct portion manifest for CVRs from one election from another election, since for some reason that file was not available in the Nov 2019 CVR election results from SF, but it was for the Mar 2020 CVR election results, and the precincts fortunately hadn't changed between those two elections.

This app is not currently online.

# Setup

1. Create .env file containing:
    * PG_CONNECTION_STRING (Required), connection string for Postgres DB
    * MC_CONNECTION_STRING (Optional), connection string for Memcached cluster
    * NEXT_PUBLIC_ANALYTICS_ID (Optional), something analytics related
2. Run `CREATE DATABASE ballots` on your Postgres DB
3. Run yarn run knex migrate:latest
4. Download 'Cast Vote Record (Raw data) - JSON' from https://sfelections.sfgov.org for the relevant election
5. Run yarn import-data $CVR_PATH
6. Launch the server, using standard Next.js commands
