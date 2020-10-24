import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import useSWR from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { getFilterPayload, getContestResults } from 'src/data';
import { getUniversalQueryParams, hasFiltersApplied } from 'src/parameters';
import FilterControls from 'src/components/FilterControls';
import Contest from 'src/components/Contest';
import Spinner from 'src/components/Spinner';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const getServerSideProps = async ({ query }) => {
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
};

const useStyles = createUseStyles({
  '@global': {
    body: {
      fontFamily: 'Inter, Helvetica, sans-serif',
    },
  },
  'container': {
    margin: '10px',
  },
  'row': {
    display: 'flex',
    flexDirection: 'row',
  },
  'contest': {
    flex: '0.5 1 0%',
  },
});

const useFetchContestResults = (
  query,
  initialQuery,
  initialResults,
  isFilteredQuery = false,
) => {
  const queryString = new URLSearchParams(query).toString();
  const key =
    !isFilteredQuery || hasFiltersApplied(query)
      ? `/api/contest_results?${queryString}`
      : null;
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    initialData:
      JSON.stringify(query) === JSON.stringify(initialQuery)
        ? initialResults
        : null,
  });
};

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

  const { data: unfilteredContestResults } = useFetchContestResults(
    getUniversalQueryParams(router.query),
    getUniversalQueryParams(initialQuery),
    initialUnfilteredContestResults,
  );

  const { data: filteredContestResults } = useFetchContestResults(
    router.query,
    initialQuery,
    initialFilteredContestResults,
    true,
  );

  const { data: filterPayload } = useSWR(`/api/filter_payload`, fetcher, {
    revalidateOnFocus: false,
    initialData: initialFilterPayload,
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

  const handleCandidateFilterChange = (candidateFilter) => {
    if (candidateFilter) {
      setCandidateFilter(candidateFilter);
    } else {
      setCandidateFilter(null);
    }

    updateUrl(selectedElection, candidateFilter);
  };

  const handleElectionChange = (e) => {
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
        <title>SF Election Results</title>
      </Head>
      <h1>San Francisco Election Results</h1>
      <FilterControls
        filterPayload={filterPayload}
        selectedElection={selectedElection}
        candidateFilter={candidateFilter}
        onChangeCandidateFilter={handleCandidateFilterChange}
        onChangeElection={handleElectionChange}
      />
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
