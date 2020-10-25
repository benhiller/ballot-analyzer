import React, { useEffect, useRef } from 'react';
import css from 'styled-jsx/css';

import {
  alternativeContestNames,
  capitalizeName,
  humanReadableContest,
  shouldRenderDistrict,
  humanReadableDistrict,
} from 'src/formatting';
// import CandidateTypeaheadMenu from 'src/components/CandidateTypeaheadMenu';

const styles = css`
  .titleContainer {
    margin: 0px -20px 15px;
    padding: 15px 20px 15px;
    background: linear-gradient(
      90deg,
      rgba(14, 82, 198, 1) 25%,
      rgba(190, 36, 51, 1) 75%
    );
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
  }
  @media (min-width: 1024px) {
    .titleContainer {
      flex-direction: row;
      width: auto;
    }
  }

  .title {
    font-size: 28px;
    font-weight: 200;
    display: inline;
    margin-top: 4px;
    margin-bottom: 10px;
  }
  @media (min-width: 1024px) {
    .title {
      margin-bottom: 0;
    }
  }

  .electionDropdown {
    width: 100%;
    height: 40px;
    padding: 5px 10px;
    border-radius: 4px;
    border-color: #fff;
    border-width: 0 10px 0 0;
  }
  @media (min-width: 1024px) {
    .electionDropdown {
      width: auto;
    }
  }

  .filtersContainer {
    display: flex;
    justify-content: center;
  }

  .filters {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .filter {
    margin-bottom: 10px;
  }

  .typeaheadLabel {
    margin-right: 5px;
  }

  :global(.typeahead) {
    display: inline-block;
    width: 300px;
  }
  :global(.typeahead .rbt-menu) {
    width: 450px !important;
  }
  :global(.typeahead .dropdown-header) {
    padding: 3px 1rem;
  }
  :global(.typeahead .rbt-input) {
    text-overflow: ellipsis;
  }
`;

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

  const handleElectionChange = (e) => {
    onChangeElection(e.target.value);
  };

  useEffect(() => {
    if (
      selectedElection &&
      elections.findIndex((e) => e.id === selectedElection) === -1
    ) {
      onChangeElection(elections[0].id);
    }

    if (candidateFilter && selectedCandidateFilter.length === 0) {
      onChangeCandidateFilter(null);
    }

    if (countingGroupFilter && selectedCountingGroupOptions.length === 0) {
      onChangeCountingGroupFilter(null);
    }

    if (districtFilter && selectedDistrictOptions.length === 0) {
      onChangeDistrictFilter(null);
    }
  });

  return (
    <>
      <style jsx>{styles}</style>
      <div className="titleContainer">
        <h1 className="title">San Francisco Ballot Analyzer</h1>
        <select
          className="electionDropdown"
          value={selectedElection}
          onChange={handleElectionChange}
        >
          {elections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.date.slice(0, 4)} {election.name}
            </option>
          ))}
        </select>
      </div>
      <div className="filtersContainer">
        <div className="filters">
          <div className="filter">
            <span className="typeaheadLabel">People who voted for</span>
            <div
              id="candidate-filter-typeahead"
              ref={candidateTypeaheadRef}
              className="typeahead"
              placeholder="anyone"
              options={candidateOptions}
              selected={selectedCandidateFilter}
              onChange={handleCandidateFilterChange}
              clearButton
              inputProps={{ spellCheck: false }}
              filterBy={['label', 'contestName', 'alternativeContestNames']}
              onBlur={() => {
                if (selectedCandidateFilter.length === 0) {
                  candidateTypeaheadRef.current &&
                    candidateTypeaheadRef.current.clear();
                }
              }}
            />
          </div>
          <div className="filter">
            <span className="typeaheadLabel">and voted via</span>
            <div
              id="counting-group-filter-typeahead"
              ref={countingGroupTypeaheadRef}
              className="typeahead"
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
          <div className="filter">
            <span className="typeaheadLabel">and voted in</span>
            <div
              id="district-filter-typeahead"
              ref={districtTypeaheadRef}
              className="typeahead"
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
