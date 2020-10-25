import React, { useState } from 'react';
import classNames from 'classnames';
import css from 'styled-jsx/css';

import { capitalizeName, humanReadableContest } from 'src/formatting';
import { computeTotalVotes } from 'src/utils';
import CandidatePercent from 'src/components/CandidatePercent';

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
  div.paginationToggle a {
    color: #888;
    font-size: 14px;
  }
  div.paginationToggle:hover a {
    color: #555;
    cursor: pointer;
  }
  .resultsTable {
    table-layout: fixed;
    width: 100%;
    white-space: nowrap;
    border-spacing: 0 5px;
    border-collapse: separate;
  }
  .unknownCandidate {
    font-style: italic;
  }
  .candidateCol {
    width: 35%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .votesCol {
    width: 15%;
    overflow: hidden;
    text-align: right;
    color: #888;
  }
  .pctCol {
    width: 25%;
    overflow: hidden;
    text-align: right;
  }
  .pctBarCol {
    width: 25%;
    padding-left: 5px;
  }
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
    top: -22px;
    height: 22px;
    background-color: #71828e;
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
      <table className="resultsTable">
        <tbody>
          {visibleCandidates.map((candidate) => (
            <tr
              key={candidate.id}
              className={classNames({
                unknownCandidate: candidate.id === 'unknown',
              })}
            >
              <td className="candidateCol">{capitalizeName(candidate.name)}</td>
              <td className="votesCol">{candidate.votes.toLocaleString()}</td>
              {!containsCandidateFilter && (
                <>
                  <td className="pctCol">
                    <CandidatePercent
                      candidate={candidate}
                      totalVotes={totalVotes}
                      unfilteredTotalVotes={contest.unfilteredTotalVotes}
                      maxPercentChange={maxPercentChange}
                      hasFiltersApplied={hasFiltersApplied}
                    />
                  </td>
                  <td className="pctBarCol">
                    {candidate.id === 'unknown' ? (
                      <div />
                    ) : (
                      <div className="barWrapper">
                        <div className="fullBar" />
                        <div
                          style={{
                            width: `${(
                              (candidate.votes / totalVotes) *
                              100
                            ).toFixed(1)}%`,
                          }}
                          className="pctBar"
                        >
                          {' '}
                        </div>
                      </div>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Contest;
