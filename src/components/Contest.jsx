import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  candidate: {},
});

const Contest = ({ contest }) => {
  const { candidates } = contest;

  const classes = useStyles();

  const [showAllCandidates, setShowAllCandidates] = useState(false);

  candidates.sort((c1, c2) => c2.votes - c1.votes);
  const totalVotes = candidates.reduce(
    (acc, candidate) => acc + candidate.votes,
    0,
  );
  const visibleCandidates = showAllCandidates
    ? candidates
    : candidates.slice(0, 5);
  return (
    <div>
      {contest.name}
      <ul>
        {visibleCandidates.map((candidate) => (
          <li key={candidate.id} className={classes.candidate}>
            {candidate.name} ({candidate.votes}){' '}
            {((candidate.votes / totalVotes) * 100).toFixed(2)}%
          </li>
        ))}
      </ul>
      {visibleCandidates.length != candidates.length && (
        <a onClick={() => setShowAllCandidates(true)}>+ Show All</a>
      )}
      {showAllCandidates && (
        <a onClick={() => setShowAllCandidates(false)}>- Show Fewer</a>
      )}
    </div>
  );
};

export default Contest;
