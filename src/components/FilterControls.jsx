import React from 'react';
import { createUseStyles } from 'react-jss';
import { Typeahead } from 'react-bootstrap-typeahead';

import { capitalizeName, humanReadableContest } from 'src/formatting';

const useStyles = createUseStyles({
  electionDropdown: {
    'width': '300px',
    'whiteSpace': 'nowrap',
    'marginBottom': '15px',
    '& span': {
      marginRight: '5px',
    },
    '& select': {
      width: 'auto',
    },
  },
  filters: {
    marginBottom: '10px',
  },
  typeaheadLabel: {
    marginRight: '5px',
  },
  typeahead: {
    'display': 'inline-block',
    'width': '300px',
    '& .rbt-menu': {
      width: '450px !important',
    },
  },
});

const FilterControls = ({
  filterPayload,
  selectedElection,
  candidateFilter,
  onChangeElection,
  onChangeCandidateFilter,
}) => {
  const classes = useStyles();

  const candidateOptions = [];
  const selectedCandidateFilter = [];
  let elections = [];
  if (filterPayload) {
    elections = filterPayload.elections;
    const candidates = [...filterPayload.candidates];
    candidates.sort((c1, c2) => {
      const contestCmp = c1.contest.id - c2.contest.id;
      if (contestCmp !== 0) {
        return contestCmp;
      }

      if (c1.name === 'Write-in' && c2 !== 'Write-in') {
        return 1;
      } else if (c1.name !== 'Write-in' && c2 === 'Write-in') {
        return -1;
      } else {
        return c1.name.localeCompare(c2.name);
      }
    });
    for (const candidate of candidates) {
      if (candidate.electionId !== selectedElection) {
        continue;
      }

      const option = {
        id: candidate.id,
        label:
          capitalizeName(candidate.name) +
          ' (' +
          humanReadableContest(candidate.contest.name) +
          ')',
      };

      candidateOptions.push(option);
      if (option.id === candidateFilter) {
        selectedCandidateFilter.push(option);
      }
    }
  }

  const handleCandidateFilterChange = (candidateFilters) => {
    const candidateFilter = candidateFilters[0];
    onChangeCandidateFilter(candidateFilter?.id);
  };

  return (
    <>
      <div className={classes.electionDropdown}>
        <span>Election:</span>
        <select
          className="custom-select"
          value={selectedElection}
          onChange={onChangeElection}
        >
          {elections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.name}
            </option>
          ))}
        </select>
      </div>
      <div className={classes.filters}>
        <span className={classes.typeaheadLabel}>People who voted for</span>
        <Typeahead
          id="candidate-filter-typeahead"
          className={classes.typeahead}
          placeholder="anyone"
          options={candidateOptions}
          selected={selectedCandidateFilter}
          onChange={handleCandidateFilterChange}
          positionFixed
          clearButton
        />
      </div>
    </>
  );
};

export default FilterControls;
