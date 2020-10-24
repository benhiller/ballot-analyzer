import React from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

const useStyles = createUseStyles({
  pctChange: {
    display: 'inline-block',
    width: '80px',
  },
  pctIncrease: {
    color: '#4fb061',
  },
  pctDecrease: {
    color: '#ae5155',
  },
});

const CandidatePercent = ({
  candidate,
  totalVotes,
  unfilteredTotalVotes,
  hasFiltersApplied,
}) => {
  const classes = useStyles();

  const candidatePercent = candidate.votes / totalVotes;
  let percentChange = 0;
  if (hasFiltersApplied) {
    const unfilteredPercent = candidate.unfilteredVotes / unfilteredTotalVotes;
    percentChange = candidatePercent - unfilteredPercent;
  }

  const formattedPercent = (candidatePercent * 100).toFixed(1) + '%';
  let changePrefix = '';
  if (percentChange > 0) {
    changePrefix = '\u2191';
  } else if (percentChange < 0) {
    changePrefix = '\u2193';
  }
  const formattedChange =
    '(' + changePrefix + (Math.abs(percentChange) * 100).toFixed(1) + '%)';

  return (
    <>
      {candidate.id !== 'unknown' && formattedPercent}
      {hasFiltersApplied && candidate.id !== 'unknown' && (
        <span
          className={classNames(classes.pctChange, {
            [classes.pctIncrease]: percentChange > 0,
            [classes.pctDecrease]: percentChange < 0,
          })}
        >
          {' '}
          {formattedChange}
        </span>
      )}
    </>
  );
};

export default CandidatePercent;
