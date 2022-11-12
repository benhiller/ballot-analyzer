import React, { useCallback, useEffect, useMemo } from 'react';
import css from 'styled-jsx/css';

import {
  alternativeContestNames,
  capitalizeName,
  humanReadableContest,
  shouldRenderDistrict,
  humanReadableDistrict,
  includeContestInOptionLabel,
} from 'src/formatting';
import Combobox from 'src/components/Combobox';
// import CandidateTypeaheadMenu from 'src/components/CandidateTypeaheadMenu';

const styles = css`
  .titleContainer {
    margin: 0px -20px 15px;
    padding: 15px 20px 15px;
    background: rgb(14, 82, 198, 1);
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
    font-size: 24px;
    font-weight: 300;
    display: inline;
    margin-bottom: 10px;
  }
  @media (min-width: 1024px) {
    .title {
      margin-bottom: 0;
      font-size: 28px;
      font-weight: 400;
    }
  }

  .dropdownContainer {
    width: 100%;
    position: relative;
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
    .dropdownContainer {
      width: auto;
    }
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

  .filters {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }
  @media (min-width: 1024px) {
    .filters {
      width: inherit;
      flex-direction: row;
    }
  }

  .filterHeader {
    width: 100%;
    margin-bottom: 10px;
  }
  @media (min-width: 1024px) {
    .filterHeader {
      text-align: right;
      width: inherit;
    }
  }
`;

const electionFields = ['label', 'groupBy', 'alternativeContestNames'];

const Header = ({
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
  const {
    elections,
    candidateOptions,
    selectedCandidateFilter,
    countingGroupOptions,
    selectedCountingGroupOption,
    districtOptions,
    selectedDistrictOption,
  } = useMemo(() => {
    const elections = filterPayload?.elections || [];
    const candidateOptions = [];
    let selectedCandidateFilter = null;
    const countingGroupOptions = [];
    let selectedCountingGroupOption = null;
    const districtOptions = [];
    let selectedDistrictOption = null;

    if (filterPayload) {
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

        const contestName = humanReadableContest(candidate.contest.name);
        const option = {
          id: candidate.id,
          label:
            capitalizeName(candidate.name) +
            (includeContestInOptionLabel(contestName)
              ? ` (${contestName})`
              : ''),
          menuLabel: capitalizeName(candidate.name),
          groupBy: contestName,
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

    return {
      elections,
      candidateOptions,
      selectedCandidateFilter,
      countingGroupOptions,
      selectedCountingGroupOption,
      districtOptions,
      selectedDistrictOption,
    };
  }, [
    filterPayload,
    selectedElection,
    candidateFilter,
    countingGroupFilter,
    districtFilter,
  ]);

  const handleCandidateFilterChange = useCallback(
    (candidateFilter) => {
      onChangeCandidateFilter(candidateFilter?.id);
    },
    [onChangeCandidateFilter],
  );

  const handleCountingGroupFilterChange = useCallback(
    (countingGroupFilter) => {
      onChangeCountingGroupFilter(countingGroupFilter?.id);
    },
    [onChangeCountingGroupFilter],
  );

  const handleDistrictFilterChange = useCallback(
    (districtFilter) => {
      onChangeDistrictFilter(districtFilter?.id);
    },
    [onChangeDistrictFilter],
  );

  const handleElectionChange = useCallback(
    (e) => {
      onChangeElection(e.target.value);
    },
    [onChangeElection],
  );

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
        <h1 className="title">San Francisco Ballot Analytics</h1>
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
      <div className="filters">
        <div className="filterHeader">
          <b>Filter results to:</b>
        </div>
        <Combobox
          id="candidate-filter-typeahead"
          className="typeahead"
          label="People who voted for"
          placeholder="anyone"
          options={candidateOptions}
          grouped
          selected={selectedCandidateFilter}
          onChange={handleCandidateFilterChange}
          filterBy={electionFields}
        />
        <Combobox
          id="counting-group-filter-typeahead"
          className="typeahead"
          label="and voted via"
          placeholder="any method"
          options={countingGroupOptions}
          selected={selectedCountingGroupOption}
          onChange={handleCountingGroupFilterChange}
        />
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
    </>
  );
};

export default Header;
