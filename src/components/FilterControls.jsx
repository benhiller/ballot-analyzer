import React, { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { Typeahead } from 'react-bootstrap-typeahead';

import {
  alternativeContestNames,
  capitalizeName,
  humanReadableContest,
} from 'src/formatting';
import CandidateTypeaheadMenu from 'src/components/CandidateTypeaheadMenu';

const useStyles = createUseStyles({
  electionDropdown: {
    'whiteSpace': 'nowrap',
    'marginBottom': '15px',
    '& span': {
      marginRight: '5px',
    },
  },
  filters: {
    width: '480px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  filter: {
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
    '& .dropdown-header': {
      padding: '3px 1rem',
    },
    '& .rbt-input': {
      textOverflow: 'ellipsis',
    },
  },
});

const FilterControls = ({
  filterPayload,
  selectedElection,
  candidateFilter,
  countingGroupFilter,
  onChangeElection,
  onChangeCandidateFilter,
  onChangeCountingGroupFilter,
}) => {
  const classes = useStyles();
  const candidateTypeaheadRef = useRef(null);
  const countingGroupTypeaheadRef = useRef(null);

  const candidateOptions = [];
  const selectedCandidateFilter = [];
  const countingGroupOptions = [];
  const selectedCountingGroupOptions = [];
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
        menuLabel: capitalizeName(candidate.name),
        contestName: humanReadableContest(candidate.contest.name),
        alternativeContestNames: alternativeContestNames(
          candidate.contest.name,
        ).join(' '),
      };

      candidateOptions.push(option);
      if (option.id === candidateFilter) {
        selectedCandidateFilter.push(option);
      }
    }

    for (const countingGroup of filterPayload.countingGroups) {
      if (countingGroup.electionId !== selectedElection) {
        continue;
      }

      const option = {
        id: countingGroup.id,
        label: countingGroup.name,
      };

      countingGroupOptions.push(option);
      if (option.id === countingGroupFilter) {
        selectedCountingGroupOptions.push(option);
      }
    }
  }

  const handleCandidateFilterChange = (candidateFilters) => {
    const candidateFilter = candidateFilters[0];
    onChangeCandidateFilter(candidateFilter?.id);
  };

  const handleCountingGroupFilterChange = (countingGroupFilters) => {
    const countingGroupFilter = countingGroupFilters[0];
    onChangeCountingGroupFilter(countingGroupFilter?.id);
  };

  return (
    <div className={classes.filters}>
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
      <div className={classes.filter}>
        <span className={classes.typeaheadLabel}>People who voted for</span>
        <Typeahead
          id="candidate-filter-typeahead"
          ref={candidateTypeaheadRef}
          className={classes.typeahead}
          placeholder="anyone"
          options={candidateOptions}
          selected={selectedCandidateFilter}
          onChange={handleCandidateFilterChange}
          positionFixed
          clearButton
          filterBy={['label', 'contestName', 'alternativeContestNames']}
          renderMenu={CandidateTypeaheadMenu}
          onBlur={() => {
            if (selectedCandidateFilter.length === 0) {
              candidateTypeaheadRef.current &&
                candidateTypeaheadRef.current.clear();
            }
          }}
        />
      </div>
      <div className={classes.filter}>
        <span className={classes.typeaheadLabel}>and voted via</span>
        <Typeahead
          id="counting-group-filter-typeahead"
          ref={countingGroupTypeaheadRef}
          className={classes.typeahead}
          placeholder="any method"
          options={countingGroupOptions}
          selected={selectedCountingGroupOptions}
          onChange={handleCountingGroupFilterChange}
          positionFixed
          clearButton
          onBlur={() => {
            if (selectedCountingGroupOptions.length === 0) {
              countingGroupTypeaheadRef.current &&
                countingGroupTypeaheadRef.current.clear();
            }
          }}
        />
      </div>
    </div>
  );
};

export default FilterControls;
