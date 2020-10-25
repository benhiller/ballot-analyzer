import React, { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { Typeahead } from 'react-bootstrap-typeahead';
import classNames from 'classnames';

import {
  alternativeContestNames,
  capitalizeName,
  humanReadableContest,
  shouldRenderDistrict,
  humanReadableDistrict,
} from 'src/formatting';
import CandidateTypeaheadMenu from 'src/components/CandidateTypeaheadMenu';

const useStyles = createUseStyles({
  titleContainer: {
    margin: '0px -20px 15px',
    padding: '15px 20px 15px',
    background:
      'linear-gradient(90deg, rgba(14,82,198,1) 25%, rgba(190,36,51,1) 75%)',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    '@media (min-width: 1024px)': {
      flexDirection: 'row',
      width: 'auto',
    },
  },
  title: {
    fontSize: '28px',
    fontWeight: 200,
    display: 'inline',
    marginTop: '4px',
    marginBottom: '10px',
    '@media (min-width: 1024px)': {
      marginBottom: 0,
    },
  },
  electionDropdown: {
    '@media (min-width: 1024px)': {
      width: 'auto',
    },
  },
  filtersContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  filters: {
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
    display: 'inline-block',
    width: '300px',
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
  districtFilter,
  onChangeElection,
  onChangeCandidateFilter,
  onChangeCountingGroupFilter,
  onChangeDistrictFilter,
}) => {
  const classes = useStyles();
  const candidateTypeaheadRef = useRef(null);
  const countingGroupTypeaheadRef = useRef(null);
  const districtTypeaheadRef = useRef(null);

  const candidateOptions = [];
  const selectedCandidateFilter = [];
  const countingGroupOptions = [];
  const selectedCountingGroupOptions = [];
  const districtOptions = [];
  const selectedDistrictOptions = [];
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

    for (const district of filterPayload.districts) {
      if (district.electionId !== selectedElection) {
        continue;
      }

      if (!shouldRenderDistrict(district)) {
        continue;
      }

      const option = {
        id: district.id,
        label: humanReadableDistrict(district),
      };

      districtOptions.push(option);
      if (option.id === districtFilter) {
        selectedDistrictOptions.push(option);
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

  const handleDistrictFilterChange = (districtFilters) => {
    const districtFilter = districtFilters[0];
    onChangeDistrictFilter(districtFilter?.id);
  };

  return (
    <>
      <div className={classes.titleContainer}>
        <h1 className={classes.title}>San Francisco Ballot Analyzer</h1>
        <select
          className={classNames('custom-select', classes.electionDropdown)}
          value={selectedElection}
          onChange={onChangeElection}
        >
          {elections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.date.slice(0, 4)} {election.name}
            </option>
          ))}
        </select>
      </div>
      <div className={classes.filtersContainer}>
        <div className={classes.filters}>
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
              clearButton
              inputProps={{ spellCheck: false }}
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
              clearButton
              inputProps={{ spellCheck: false }}
              onBlur={() => {
                if (selectedCountingGroupOptions.length === 0) {
                  countingGroupTypeaheadRef.current &&
                    countingGroupTypeaheadRef.current.clear();
                }
              }}
            />
          </div>
          <div className={classes.filter}>
            <span className={classes.typeaheadLabel}>and voted in</span>
            <Typeahead
              id="district-filter-typeahead"
              ref={districtTypeaheadRef}
              className={classes.typeahead}
              placeholder="anywhere"
              options={districtOptions}
              selected={selectedDistrictOptions}
              onChange={handleDistrictFilterChange}
              clearButton
              inputProps={{ spellCheck: false }}
              onBlur={() => {
                if (selectedDistrictOptions.length === 0) {
                  districtTypeaheadRef.current &&
                    districtTypeaheadRef.current.clear();
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterControls;
