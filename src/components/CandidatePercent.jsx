import React from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

const useStyles = createUseStyles({
  pctChange: {
    display: 'inline-block',
  },
  singleDigitPctChange: {
    width: '55px',
  },
  doubleDigitPctChange: {
    width: '65px',
  },
  tripleDigitPctChange: {
    width: '75px',
  },
  pctNoChange: {
    textAlign: 'center',
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
  maxPercentChange,
  hasFiltersApplied,
}) => {
  const classes = useStyles();

  const candidatePercent = candidate.votes / totalVotes;
  let percentChange = 0;
  if (hasFiltersApplied) {
    const unfilteredPercent = candidate.unfilteredVotes / unfilteredTotalVotes;
    percentChange = ((candidatePercent - unfilteredPercent) * 100).toFixed(1);
  }

  const formattedPercent = (candidatePercent * 100).toFixed(1) + '%';
  let changePrefix = '';
  if (percentChange > 0) {
    changePrefix = '\u2191';
  } else if (percentChange < 0) {
    changePrefix = '\u2193';
  }
  const formattedChange =
    // eslint-disable-next-line eqeqeq
    percentChange == 0
      ? '-'
      : '(' + changePrefix + Math.abs(percentChange) + ')';

  return (
    <>
      {candidate.id !== 'unknown' && formattedPercent}
      {hasFiltersApplied && candidate.id !== 'unknown' && (
        <span
          className={classNames(classes.pctChange, {
            [classes.singleDigitPctChange]: maxPercentChange < 0.1,
            [classes.doubleDigitPctChange]:
              maxPercentChange >= 0.1 && maxPercentChange < 1.0,
            [classes.tripleDigitPctChange]: maxPercentChange === 1.0,
            [classes.pctIncrease]: percentChange > 0,
            [classes.pctDecrease]: percentChange < 0,
            // eslint-disable-next-line eqeqeq
            [classes.pctNoChange]: percentChange == 0,
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
