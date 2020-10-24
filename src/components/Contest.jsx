import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';

import { capitalizeName, humanReadableContest } from 'src/formatting';

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
  resultsTable: {
    tableLayout: 'fixed',
    width: '100%',
    whiteSpace: 'nowrap',
    borderSpacing: '0 5px',
    borderCollapse: 'separate',
  },
  candidateCol: {
    width: '25%',
  },
  votesCol: {
    width: '15%',
    textAlign: 'right',
    color: '#888',
  },
  pctCol: {
    width: '10%',
    textAlign: 'right',
    paddingLeft: '25px',
  },
  pctBarCol: {
    width: '15%',
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

const Contest = ({ contest, totalVotesForFilteredCandidate }) => {
  // filter is important, without it we'd need to do array spread to ensure
  // sort doesn't mutate candidates
  const candidates = contest.candidates.filter((c) => c.votes !== 0);

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
    <div className={classes.container}>
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
      <table className={classes.resultsTable}>
        <tbody>
          {visibleCandidates.map((candidate) => (
            <tr key={candidate.id}>
              <td className={classes.candidateCol}>
                {capitalizeName(candidate.name)}
              </td>
              <td className={classes.votesCol}>
                {candidate.votes.toLocaleString()}
              </td>
              <td className={classes.pctCol}>
                {candidate.id === 'unknown'
                  ? '-'
                  : `${((candidate.votes / totalVotes) * 100).toFixed(1)}%`}
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
