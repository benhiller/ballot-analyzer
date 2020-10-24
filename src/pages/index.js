import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import useSWR from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Typeahead } from 'react-bootstrap-typeahead';

import { getFilterPayload, getContestResults } from 'src/data';
import { capitalizeName, humanReadableContest } from 'src/formatting';
import Contest from 'src/components/Contest';
import Spinner from 'src/components/Spinner';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const getUniversalQueryParams = (query) => {
  return query.election ? { election: query.election } : {};
};

const hasFiltersApplied = (query) => {
  return !!query.candidate;
};

export async function getServerSideProps({ query }) {
  const initialUnfilteredContestResults = await getContestResults(
    getUniversalQueryParams(query),
  );
  const initialFilteredContestResults = hasFiltersApplied(query)
    ? await getContestResults(query)
    : null;
  const initialFilterPayload = await getFilterPayload();
  return {
    props: {
      initialFilterPayload,
      initialUnfilteredContestResults,
      initialFilteredContestResults,
      initialQuery: query,
    },
  };
}

const useStyles = createUseStyles({
  '@global': {
    body: {
      fontFamily: 'Inter, Helvetica, sans-serif',
    },
  },
  'container': {
    margin: '10px',
  },
  'electionDropdown': {
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
  'filters': {
    marginBottom: '10px',
  },
  'typeaheadLabel': {
    marginRight: '5px',
  },
  'typeahead': {
    'display': 'inline-block',
    'width': '300px',
    '& .rbt-menu': {
      width: '450px !important',
    },
  },
  'row': {
    display: 'flex',
    flexDirection: 'row',
  },
  'contest': {
    flex: '0.5 1 0%',
  },
});

function HomePage({
  initialUnfilteredContestResults,
  initialFilteredContestResults,
  initialFilterPayload,
  initialQuery,
}) {
  const classes = useStyles();

  const router = useRouter();

  const [candidateFilter, setCandidateFilter] = useState(
    router.query?.candidate || null,
  );

  const [selectedElection, setSelectedElection] = useState(
    router.query?.election || initialFilterPayload.elections[0].id,
  );

  const unfilteredQueryString = new URLSearchParams(
    getUniversalQueryParams(router.query),
  ).toString();
  const { data: unfilteredContestResults } = useSWR(
    `/api/contest_results?${unfilteredQueryString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      initialData:
        JSON.stringify(getUniversalQueryParams(router.query)) ===
        JSON.stringify(getUniversalQueryParams(initialQuery))
          ? initialUnfilteredContestResults
          : null,
    },
  );

  const queryString = new URLSearchParams(router.query).toString();
  const { data: filteredContestResults } = useSWR(
    hasFiltersApplied(router.query)
      ? `/api/contest_results?${queryString}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      initialData:
        JSON.stringify(router.query) === JSON.stringify(initialQuery)
          ? initialFilteredContestResults
          : null,
    },
  );

  const { data: filterPayload } = useSWR(`/api/filter_payload`, fetcher, {
    revalidateOnFocus: false,
    initialData:
      JSON.stringify(router.query) === JSON.stringify(initialQuery)
        ? initialFilterPayload
        : null,
  });

  let groupedContests = [];
  let totalVotesForFilteredCandidate = 0;
  const contestResults = hasFiltersApplied(router.query)
    ? filteredContestResults
    : unfilteredContestResults;
  if (contestResults) {
    groupedContests = contestResults
      .filter(
        (contest) =>
          !candidateFilter ||
          contest.candidates.findIndex(
            (candidate) => candidate.id === candidateFilter,
          ) === -1,
      )
      .reduce((arr, contest) => {
        if (arr.length === 0) {
          arr.push([contest]);
        } else if (arr[arr.length - 1].length === 2) {
          arr.push([contest]);
        } else {
          arr[arr.length - 1].push(contest);
        }
        return arr;
      }, []);
    totalVotesForFilteredCandidate = candidateFilter
      ? contestResults.find((contest) =>
          contest.candidates.find(
            (candidate) => candidate.id === candidateFilter,
          ),
        ).distinctVotes
      : 0;
  }

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

  const updateUrl = (selectedElection, candidateFilter) => {
    const urlQuery = {};
    if (candidateFilter) {
      urlQuery.candidate = candidateFilter;
    }

    if (selectedElection !== filterPayload.elections[0].id) {
      urlQuery.election = selectedElection;
    }

    const queryString = new URLSearchParams(urlQuery).toString();
    if (Object.keys(urlQuery).length > 0) {
      router.push(`/?${queryString}`, undefined, { shallow: true });
    } else {
      router.push(`/`, undefined, { shallow: true });
    }
  };

  const changeCandidateFilter = (candidateFilters) => {
    const candidateFilter = candidateFilters[0];
    if (candidateFilter) {
      setCandidateFilter(candidateFilter.id);
    } else {
      setCandidateFilter(null);
    }

    updateUrl(selectedElection, candidateFilter?.id);
  };

  const changeElection = (e) => {
    const electionId = e.target.value;
    if (electionId === selectedElection) {
      return;
    }

    setSelectedElection(electionId);
    setCandidateFilter(null);
    updateUrl(electionId, null);
  };

  return (
    <div className={classes.container}>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Inter"
        />
        <title>SF Election Analyzer</title>
      </Head>
      <h1>San Francisco Election Results</h1>
      <div className={classes.electionDropdown}>
        <span>Election:</span>
        <select
          className="custom-select"
          value={selectedElection}
          onChange={changeElection}
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
          onChange={changeCandidateFilter}
          positionFixed
          clearButton
        />
      </div>
      {!groupedContests.length && <Spinner />}
      {groupedContests.map((contests, idx) => (
        <div key={idx} className={classes.row}>
          {contests.map((contest) => (
            <div key={contest.id} className={classes.contest}>
              <Contest
                contest={contest}
                totalVotesForFilteredCandidate={totalVotesForFilteredCandidate}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default HomePage;
