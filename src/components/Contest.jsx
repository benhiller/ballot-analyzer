import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import { capitalizeName, humanReadableContest } from 'src/formatting';
import { computeTotalVotes } from 'src/utils';
import CandidatePercent from 'src/components/CandidatePercent';

const useStyles = createUseStyles({
  container: {
    padding: '10px',
    border: '1px solid #ccc',
    margin: '10px',
    borderRadius: '3px',
    height: 'calc(100% - 20px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    paddingBottom: '5px',
    borderBottom: '1px solid #eee',
  },
  name: {
    fontWeight: 'bold',
  },
  paginationToggle: {
    color: '#888',
    fontSize: '14px',
    '&:hover': {
      color: '#555',
      cursor: 'pointer',
    },
  },
  resultsTable: {
    tableLayout: 'fixed',
    width: '100%',
    whiteSpace: 'nowrap',
    borderSpacing: '0 5px',
    borderCollapse: 'separate',
  },
  unknownCandidate: {
    fontStyle: 'italic',
  },
  candidateCol: {
    width: '35%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  votesCol: {
    width: '15%',
    overflow: 'hidden',
    textAlign: 'right',
    color: '#888',
  },
  pctCol: {
    width: '25%',
    overflow: 'hidden',
    textAlign: 'right',
  },
  pctBarCol: {
    width: '25%',
    paddingLeft: '5px',
  },
  barWrapper: {
    height: '22px',
    position: 'relative',
  },
  fullBar: {
    width: '100%',
    height: '22px',
    backgroundColor: '#f2f2f2',
  },
  pctBar: {
    position: 'relative',
    top: '-22px',
    height: '22px',
    backgroundColor: '#71828e',
  },
});

const Contest = ({
  contest,
  hasFiltersApplied,
  totalVotesForFilteredCandidate,
}) => {
  // filter is important, without it we'd need to do array spread to ensure
  // sort doesn't mutate candidates
  const candidates = contest.candidates.filter((c) => c.votes !== 0);

  const classes = useStyles();

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
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.name}>{humanReadableContest(contest.name)}</div>
        <div className={classes.paginationToggle}>
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
      <table className={classes.resultsTable}>
        <tbody>
          {visibleCandidates.map((candidate) => (
            <tr
              key={candidate.id}
              className={classNames({
                [classes.unknownCandidate]: candidate.id === 'unknown',
              })}
            >
              <td className={classes.candidateCol}>
                {capitalizeName(candidate.name)}
              </td>
              <td className={classes.votesCol}>
                {candidate.votes.toLocaleString()}
              </td>
              <td className={classes.pctCol}>
                <CandidatePercent
                  candidate={candidate}
                  totalVotes={totalVotes}
                  unfilteredTotalVotes={contest.unfilteredTotalVotes}
                  maxPercentChange={maxPercentChange}
                  hasFiltersApplied={hasFiltersApplied}
                />
              </td>
              <td className={classes.pctBarCol}>
                {candidate.id === 'unknown' ? (
                  <div />
                ) : (
                  <div className={classes.barWrapper}>
                    <div className={classes.fullBar} />
                    <div
                      style={{
                        width: `${(
                          (candidate.votes / totalVotes) *
                          100
                        ).toFixed(1)}%`,
                      }}
                      className={classes.pctBar}
                    >
                      {' '}
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Contest;
