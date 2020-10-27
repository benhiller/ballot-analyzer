import React, { useState } from 'react';
import classNames from 'classnames';
import css from 'styled-jsx/css';
import Tooltip from 'react-tooltip-lite';

import { capitalizeName, humanReadableContest } from 'src/formatting';
import { computeTotalVotes } from 'src/utils';
import CandidatePercent from 'src/components/CandidatePercent';
import CandidateBar from 'src/components/CandidateBar';

const styles = css`
  .contestContainer {
    padding: 10px;
    border: 1px solid #ccc;
    margin: 10px;
    border-radius: 3px;
    height: calc(100% - 20px);
  }
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
  }
  .name {
    font-weight: 600;
  }
  .paginationToggle {
    text-align: right;
  }
  div.paginationToggle a {
    color: #888;
    font-size: 14px;
  }
  div.paginationToggle:hover a {
    color: #555;
    cursor: pointer;
  }
  .unknownCandidate {
    font-style: italic;
  }

  .tableRow {
    margin-bottom: 8px;
  }
  .smallerRow {
    display: flex;
    justify-content: space-between;
  }
  .candidateCol {
    width: 75%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .votesCol {
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
    color: #888;
    padding-right: 2px;
  }
  .pctCol {
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }
  .pctBarCol {
    padding-left: 5px;
    width: 50%;
  }
  @media (min-width: 1024px) {
    .resultsTable {
      table-layout: fixed;
      display: table;
      width: 100%;
      white-space: nowrap;
      border-spacing: 0 5px;
      border-collapse: separate;
    }
    .col {
      display: table-cell;
    }
    .candidateCol {
      width: 35%;
    }
    .votesCol {
      width: 15%;
    }
    .pctCol {
      width: 25%;
    }
    .pctBarCol {
      width: 25%;
    }
    .tableRow {
      display: table-row;
    }
    .smallerRow {
      display: contents;
    }
  }

  :global(.unknownTooltipTarget) {
    display: inline-block;
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    color: white;
    background-color: #aaa;
    border-radius: 15px;
    height: 15px;
    width: 15px;
    margin-left: 3px;
    text-align: center;
    line-height: 1.1;
  }

  :global(.unknownTooltip .react-tooltip-lite) {
    border-radius: 4px;
    background-color: #333;
    color: white;
    font-size: 14px;
    width: 250px !important;
  }
`;

const Contest = ({
  contest,
  hasFiltersApplied,
  containsCandidateFilter,
  totalVotesForFilteredCandidate,
}) => {
  // filter is important, without it we'd need to do array spread to ensure
  // sort doesn't mutate candidates
  const candidates = contest.candidates.filter((c) => c.votes !== 0);

  const [showAllCandidates, setShowAllCandidates] = useState(false);

  const totalVotes = computeTotalVotes(candidates);
  const unknownVotes = totalVotesForFilteredCandidate - contest.distinctVotes;

  candidates.sort((c1, c2) => c2.votes - c1.votes);

  let maxPercentChange = 0.0;
  if (hasFiltersApplied) {
    for (const candidate of contest.candidates) {
      const candidatePercent = candidate.votes / totalVotes;
      const unfilteredPercent =
        candidate.unfilteredVotes / contest.unfilteredTotalVotes;
      const percentChange = Math.abs(candidatePercent - unfilteredPercent);
      if (percentChange >= maxPercentChange) {
        maxPercentChange = percentChange;
      }
    }
  }

  if (unknownVotes > 0) {
    candidates.unshift({
      id: 'unknown',
      name: 'Unknown',
      votes: unknownVotes,
    });
  }

  const visibleCandidates = showAllCandidates
    ? candidates
    : candidates.slice(0, 5);
  return (
    <div className="contestContainer">
      <style jsx>{styles}</style>
      <div className="header">
        <div className="name">{humanReadableContest(contest.name)}</div>
        <div className="paginationToggle">
          {visibleCandidates.length !== candidates.length && (
            <a onClick={() => setShowAllCandidates(true)}>
              + Show All Candidates
            </a>
          )}
          {showAllCandidates && (
            <a onClick={() => setShowAllCandidates(false)}>
              - Show Fewer Candidates
            </a>
          )}
        </div>
      </div>
      <div className="resultsTable">
        {visibleCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className={classNames('tableRow', {
              unknownCandidate: candidate.id === 'unknown',
            })}
          >
            <span className="smallerRow">
              <div className="col candidateCol">
                {capitalizeName(candidate.name)}{' '}
                {candidate.id === 'unknown' && (
                  <Tooltip
                    className="unknownTooltipTarget"
                    tipContentClassName="unknownTooltip"
                    content="When filtering by candidate, some votes may be unknown due to their contest being on a separate ballot page from the contest containing the filtered candidate. Votes may also be unknown if the voter not in a district eligible to vote on this contest, or if the voter decided not to vote in this contest."
                    direction="down"
                    arrowSize={5}
                  >
                    ?
                  </Tooltip>
                )}
              </div>
              <div className="col votesCol">
                {candidate.votes.toLocaleString()}
              </div>
            </span>
            {!containsCandidateFilter && (
              <span className="smallerRow">
                <div className="col pctCol">
                  <CandidatePercent
                    candidate={candidate}
                    totalVotes={totalVotes}
                    unfilteredTotalVotes={contest.unfilteredTotalVotes}
                    maxPercentChange={maxPercentChange}
                    hasFiltersApplied={hasFiltersApplied}
                  />
                </div>
                <div className="col pctBarCol">
                  {candidate.id === 'unknown' ? (
                    <div />
                  ) : (
                    <CandidateBar
                      candidate={candidate}
                      contest={contest}
                      hasFiltersApplied={hasFiltersApplied}
                      totalVotes={totalVotes}
                    />
                  )}
                </div>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contest;
