import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  candidate: {},
});

const Contest = ({ candidates }) => {
  const classes = useStyles();

  candidates.sort((c1, c2) => c2.votes - c1.votes);
  const totalVotes = candidates.reduce(
    (acc, candidate) => acc + candidate.votes,
    0,
  );
  const visibleCandidates = candidates.slice(0, 5);
  return (
    <div>
      {candidates[0].contest_name}
      <ul>
        {visibleCandidates.map((candidate) => (
          <li key={candidate.candidate_id} className={classes.candidate}>
            {candidate.candidate_name}{' '}
            {((candidate.votes / totalVotes) * 100).toFixed(2)}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contest;
