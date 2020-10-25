import React, { useEffect } from 'react';
import css from 'styled-jsx/css';

import {
  alternativeContestNames,
  capitalizeName,
  humanReadableContest,
  shouldRenderDistrict,
  humanReadableDistrict,
} from 'src/formatting';
import Combobox from 'src/components/Combobox';
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
    line-height: 1.1;
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
    height: 38px;
    padding: 5px 10px;
    background-color: #fff;
    appearance: none;
    -webkit-appearance: none;
    border-radius: 4px;
    border: 1px solid #fff;
    padding-right: 28px;
  }
  @media (min-width: 1024px) {
    .electionDropdown {
      width: auto;
    }
  }

  .dropdownContainer {
    position: relative;
  }

  .dropdownChevron {
    position: absolute;
    right: 0;
    color: black;
    top: 0;
    bottom: 0;
    margin-top: 14px;
    margin-right: 12px;
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

  .filterHeader {
    width: 100%;
    text-align: center;
  }

  .filter {
    margin-bottom: 10px;
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
  const candidateOptions = [];
  let selectedCandidateFilter = null;
  const countingGroupOptions = [];
  let selectedCountingGroupOption = null;
  const districtOptions = [];
  let selectedDistrictOption = null;
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
        selectedCandidateFilter = option;
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
        selectedCountingGroupOption = option;
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
        selectedDistrictOption = option;
      }
    }
  }

  const handleCandidateFilterChange = (candidateFilter) => {
    onChangeCandidateFilter(candidateFilter?.id);
  };

  const handleCountingGroupFilterChange = (countingGroupFilter) => {
    onChangeCountingGroupFilter(countingGroupFilter?.id);
  };

  const handleDistrictFilterChange = (districtFilter) => {
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

    if (candidateFilter && !selectedCandidateFilter) {
      onChangeCandidateFilter(null);
    }

    if (countingGroupFilter && !selectedCountingGroupOption) {
      onChangeCountingGroupFilter(null);
    }

    if (districtFilter && !selectedDistrictOption) {
      onChangeDistrictFilter(null);
    }
  });

  return (
    <>
      <style jsx>{styles}</style>
      <div className="titleContainer">
        <h1 className="title">San Francisco Ballot Analyzer</h1>
        <div className="dropdownContainer">
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
          <img
            className="dropdownChevron"
            src="/chevron.png"
            srcSet="/chevron@2x.png 2x"
          />
        </div>
      </div>
      <div className="filtersContainer">
        <div className="filters">
          <div className="filter filterHeader">
            <span>
              <b>Filter results to:</b>
            </span>
          </div>
          <div className="filter">
            <Combobox
              id="candidate-filter-typeahead"
              className="typeahead"
              label="People who voted for"
              placeholder="anyone"
              options={candidateOptions}
              selected={selectedCandidateFilter}
              onChange={handleCandidateFilterChange}
              filterBy={['label', 'contestName', 'alternativeContestNames']}
            />
          </div>
          <div className="filter">
            <Combobox
              id="counting-group-filter-typeahead"
              className="typeahead"
              label="and voted via"
              placeholder="any method"
              options={countingGroupOptions}
              selected={selectedCountingGroupOption}
              onChange={handleCountingGroupFilterChange}
            />
          </div>
          <div className="filter">
            <Combobox
              id="district-filter-typeahead"
              className="typeahead"
              label="and voted in"
              placeholder="anywhere"
              options={districtOptions}
              selected={selectedDistrictOption}
              onChange={handleDistrictFilterChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterControls;
