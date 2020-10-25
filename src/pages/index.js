import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import useSWR from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { getFilterPayload, getContestResults } from 'src/data';
import {
  getUniversalQueryParams,
  queryHasFiltersApplied,
} from 'src/parameters';
import { computeTotalVotes } from 'src/utils';
import FilterControls from 'src/components/FilterControls';
import Contest from 'src/components/Contest';
import Spinner from 'src/components/Spinner';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const getServerSideProps = async ({ query }) => {
  const initialUnfilteredContestResults = await getContestResults(
    getUniversalQueryParams(query),
  );
  const initialFilteredContestResults = queryHasFiltersApplied(query)
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
  container: {
    margin: '0 20px',
  },
  blankState: {
    padding: '50px 0',
    textAlign: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 -10px',
    '@media (min-width: 1024px)': {
      flexDirection: 'row',
    },
  },
  contest: {
    flex: '0.5 1 0%',
  },
  footer: {
    backgroundColor: '#f2f2f2',
    margin: '20px -20px -20px',
    padding: '50px 50px 30px',
    textAlign: 'center',
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
    !isFilteredQuery || queryHasFiltersApplied(query)
      ? `/api/contest_results?${queryString}`
      : null;
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    initialData:
      JSON.stringify(query) === JSON.stringify(initialQuery)
        ? initialResults
        : null,
  });
};

const augmentResultsWithPercentChanges = (
  filteredContestResults,
  unfilteredContestResults,
) => {
  for (const contest of filteredContestResults) {
    const unfilteredContest = unfilteredContestResults.find(
      (c) => c.id === contest.id,
    );
    const unfilteredTotalVotes = computeTotalVotes(
      unfilteredContest.candidates,
    );
    contest.unfilteredTotalVotes = unfilteredTotalVotes;
    for (const candidate of contest.candidates) {
      candidate.unfilteredVotes = unfilteredContest.candidates.find(
        (c) => c.id === candidate.id,
      ).votes;
    }
  }
  return filteredContestResults;
};

const groupContests = (contestResults) => {
  return contestResults.reduce((arr, contest) => {
    if (arr.length === 0) {
      arr.push([contest]);
    } else if (arr[arr.length - 1].length === 2) {
      arr.push([contest]);
    } else {
      arr[arr.length - 1].push(contest);
    }
    return arr;
  }, []);
};

const filterContests = (contestResults, candidateFilter) => {
  if (!candidateFilter) {
    return contestResults;
  }

  const contestForCandidateFilter = contestResults.find(
    (c) => c.candidates.findIndex((cand) => cand.id === candidateFilter) !== -1,
  );
  // Include this contest, since seeing what other votes people cast in the
  // same contest can be interesting
  if (contestForCandidateFilter?.numVotes > 1) {
    return contestResults;
  }

  return contestResults.filter(
    (contest) =>
      contest.candidates.findIndex(
        (candidate) => candidate.id === candidateFilter,
      ) === -1,
  );
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

  const [countingGroupFilter, setCountingGroupFilter] = useState(
    router.query?.countingGroup || null,
  );

  const hasFiltersApplied = candidateFilter || countingGroupFilter;

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
    revalidateOnReconnect: false,
    initialData: initialFilterPayload,
  });

  let loading = true;
  let groupedContests = [];
  let totalVotesForFilteredCandidate = 0;
  if (hasFiltersApplied && filteredContestResults && unfilteredContestResults) {
    loading = false;
    groupedContests = groupContests(
      augmentResultsWithPercentChanges(
        filterContests(filteredContestResults, candidateFilter),
        unfilteredContestResults,
      ),
    );

    totalVotesForFilteredCandidate = candidateFilter
      ? filteredContestResults.find((contest) =>
          contest.candidates.find(
            (candidate) => candidate.id === candidateFilter,
          ),
        )?.distinctVotes
      : 0;
  } else if (!hasFiltersApplied && unfilteredContestResults) {
    loading = false;
    groupedContests = groupContests(unfilteredContestResults, null);
  }

  const updateUrl = (
    selectedElection,
    candidateFilter,
    countingGroupFilter,
  ) => {
    const urlQuery = {};
    if (candidateFilter) {
      urlQuery.candidate = candidateFilter;
    }

    if (countingGroupFilter) {
      urlQuery.countingGroup = countingGroupFilter;
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

  const handleCountingGroupFilterChange = (countingGroupFilter) => {
    if (countingGroupFilter) {
      setCountingGroupFilter(countingGroupFilter);
    } else {
      setCountingGroupFilter(null);
    }

    updateUrl(selectedElection, candidateFilter, countingGroupFilter);
  };

  const handleElectionChange = (e) => {
    const electionId = e.target.value;
    if (electionId === selectedElection) {
      return;
    }

    setSelectedElection(electionId);
    setCandidateFilter(null);
    setCountingGroupFilter(null);
    updateUrl(electionId, null);
  };

  return (
    <div className={classes.container}>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Inter"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SF Ballot Analyzer</title>
      </Head>
      <FilterControls
        filterPayload={filterPayload}
        selectedElection={selectedElection}
        candidateFilter={candidateFilter}
        countingGroupFilter={countingGroupFilter}
        onChangeCandidateFilter={handleCandidateFilterChange}
        onChangeCountingGroupFilter={handleCountingGroupFilterChange}
        onChangeElection={handleElectionChange}
      />
      {loading && <Spinner />}
      {!loading && groupedContests.length === 0 && (
        <div className={classes.blankState}>
          No elections found. Try removing a filter.
        </div>
      )}
      {groupedContests.map((contests, idx) => (
        <div key={idx} className={classes.row}>
          {contests.map((contest) => (
            <div key={contest.id} className={classes.contest}>
              <Contest
                contest={contest}
                hasFiltersApplied={hasFiltersApplied}
                totalVotesForFilteredCandidate={totalVotesForFilteredCandidate}
              />
            </div>
          ))}
        </div>
      ))}
      <div className={classes.footer}>
        <p>
          Created by <a href="https://github.com/benhiller">Ben Hiller</a> with
          data from the{' '}
          <a href="https://sfelections.sfgov.org/data-and-maps">
            SF Department of Elections
          </a>
          .
        </p>
        <p>
          View the source on{' '}
          <a href="https://github.com/benhiller/ballot-analyzer">GitHub</a>.
        </p>
      </div>
    </div>
  );
}

export default HomePage;
