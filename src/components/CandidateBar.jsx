import React from 'react';
import classNames from 'classnames';
import css from 'styled-jsx/css';

const styles = css`
  .barWrapper {
    height: 22px;
    position: relative;
  }
  .fullBar {
    width: 100%;
    height: 22px;
    background-color: #f2f2f2;
  }
  .pctBar {
    position: relative;
    display: inline-block;
    top: -22px;
    height: 22px;
    background-color: #71828e;
  }
  .pctIncreaseBar {
    background-color: #4fb061;
  }
  .pctDecreaseBar {
    background-color: #ae5155;
  }
`;

const CandidateBar = ({
  candidate,
  contest,
  totalVotes,
  hasFiltersApplied,
}) => {
  let showIncreaseBar = false;
  let showDecreaseBar = false;
  let baseWidth = ((candidate.votes / totalVotes) * 100).toFixed(1);
  let extraWidth = null;
  if (hasFiltersApplied) {
    const filteredPct = ((candidate.votes / totalVotes) * 100).toFixed(1);
    const unfilteredPct = (
      (candidate.unfilteredVotes / contest.unfilteredTotalVotes) *
      100
    ).toFixed(1);

    if (filteredPct - unfilteredPct > 0) {
      showIncreaseBar = true;
      baseWidth = unfilteredPct;
      extraWidth = filteredPct - unfilteredPct;
    } else if (filteredPct - unfilteredPct < 0) {
      showDecreaseBar = true;
      baseWidth = filteredPct;
      extraWidth = unfilteredPct - filteredPct;
    }
  }

  return (
    <div className="barWrapper">
      <style jsx>{styles}</style>
      <div className="fullBar" />
      <div
        style={{
          width: `${baseWidth}%`,
        }}
        className="pctBar"
      />
      {(showIncreaseBar || showDecreaseBar) && (
        <div
          style={{
            width: `${extraWidth}%`,
          }}
          className={classNames('pctBar', {
            pctIncreaseBar: showIncreaseBar,
            pctDecreaseBar: showDecreaseBar,
          })}
        />
      )}
    </div>
  );
};

export default CandidateBar;
