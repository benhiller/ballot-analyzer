import React from 'react';
import classNames from 'classnames';
import css from 'styled-jsx/css';

const styles = css`
  .pctChange {
    display: inline-block;
  }
  .singleDigitPctChange {
    width: 55px;
  }
  .doubleDigitPctChange {
    width: 65px;
  }
  .tripleDigitPctChange {
    width: 75px;
  }
  .pctNoChange {
    text-align: center;
  }
  .pctIncrease {
    color: #4fb061;
  }
  .pctDecrease {
    color: #ae5155;
  }
`;

const CandidatePercent = ({
  candidate,
  totalVotes,
  unfilteredTotalVotes,
  maxPercentChange,
  hasFiltersApplied,
}) => {
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
      <style jsx>{styles}</style>
      {candidate.id !== 'unknown' && formattedPercent}
      {hasFiltersApplied && candidate.id !== 'unknown' && (
        <span
          className={classNames('pctChange', {
            singleDigitPctChange: maxPercentChange < 0.1,
            doubleDigitPctChange:
              maxPercentChange >= 0.1 && maxPercentChange < 1.0,
            tripleDigitPctChange: maxPercentChange === 1.0,
            pctIncrease: percentChange > 0,
            pctDecrease: percentChange < 0,
            // eslint-disable-next-line eqeqeq
            pctNoChange: percentChange == 0,
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
