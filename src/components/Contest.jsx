import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';

import { capitalizeName, humanReadableContest } from 'src/formatting';

const useStyles = createUseStyles({
  candidate: {},
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const Contest = ({ contest, totalVotesForFilteredCandidate }) => {
  const candidates = [...contest.candidates];

  const classes = useStyles();

  const [showAllCandidates, setShowAllCandidates] = useState(false);

  const totalVotes = candidates.reduce(
    (acc, candidate) => acc + candidate.votes,
    0,
  );
  const unknownVotes = totalVotesForFilteredCandidate - contest.distinctVotes;
  if (unknownVotes > 0) {
    candidates.push({
      id: 'unknown',
      name: 'Unknown',
      votes: unknownVotes,
    });
  }

  candidates.sort((c1, c2) => c2.votes - c1.votes);

  const visibleCandidates = showAllCandidates
    ? candidates
    : candidates.slice(0, 5);
  return (
    <div>
      <div className={classes.header}>
        <div>{humanReadableContest(contest.name)}</div>
        <div>
          {visibleCandidates.length !== candidates.length && (
            <a onClick={() => setShowAllCandidates(true)}>+ Show All</a>
          )}
          {showAllCandidates && (
            <a onClick={() => setShowAllCandidates(false)}>- Show Fewer</a>
          )}
        </div>
      </div>
      <ul>
        {visibleCandidates.map((candidate) => (
          <li key={candidate.id} className={classes.candidate}>
            {capitalizeName(candidate.name)} ({candidate.votes}){' '}
            {((candidate.votes / totalVotes) * 100).toFixed(2)}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contest;
