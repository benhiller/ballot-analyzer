import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import useSWR from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Typeahead } from 'react-bootstrap-typeahead';

import { getFilterPayload, getContestResults } from 'src/data';
import { capitalizeName, humanReadableContest } from 'src/formatting';
import Contest from 'src/components/Contest';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export async function getServerSideProps({ query }) {
  const initialContestResults = await getContestResults(query);
  const initialFilterPayload = await getFilterPayload();
  return {
    props: {
      initialFilterPayload,
      initialContestResults,
      initialQuery: JSON.stringify(query),
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
    flex: 1,
    border: '1px solid #ccc',
    margin: '10px',
    padding: '10px',
    borderRadius: '3px',
  },
});

function HomePage({
  initialContestResults,
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

  const queryString = new URLSearchParams(router.query).toString();
  const { data: contestResults } = useSWR(
    `/api/contest_results?${queryString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      initialData:
        JSON.stringify(router.query) === initialQuery
          ? initialContestResults
          : null,
    },
  );

  const { data: filterPayload } = useSWR(`/api/filter_payload`, fetcher, {
    revalidateOnFocus: false,
    initialData:
      JSON.stringify(router.query) === initialQuery
        ? initialFilterPayload
        : null,
  });

  let groupedContests = [];
  if (contestResults) {
    groupedContests = contestResults.reduce((arr, contest) => {
      if (arr.length === 0) {
        arr.push([contest]);
      } else if (arr[arr.length - 1].length === 2) {
        arr.push([contest]);
      } else {
        arr[arr.length - 1].push(contest);
      }
      return arr;
    }, []);
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
    console.log(selectedElection, candidateFilter);
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
      router.push(`/?candidate=${candidateFilter.id}`, undefined, {
        shallow: true,
      });
    } else {
      setCandidateFilter(null);
      router.push(`/`, undefined, { shallow: true });
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
      {groupedContests.map((contests, idx) => (
        <div key={idx} className={classes.row}>
          {contests.map((contest) => (
            <div key={contest.id} className={classes.contest}>
              <Contest contest={contest} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default HomePage;
