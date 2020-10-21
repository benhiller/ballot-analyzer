import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { Typeahead } from 'react-bootstrap-typeahead';

import { getAllCandidates, getContestResults } from 'src/data';
import { capitalizeName, humanReadableContest } from 'src/formatting';
import Contest from 'src/components/Contest';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export async function getServerSideProps({ query }) {
  const initialContestResults = await getContestResults(query);
  const initialAllCandidates = await getAllCandidates(query);
  return {
    props: {
      initialAllCandidates,
      initialContestResults,
      initialQuery: JSON.stringify(query),
    },
  };
}

const useStyles = createUseStyles({
  container: {
    margin: '10px',
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
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  contest: {
    flex: 1,
    border: '1px solid #ccc',
    margin: '10px',
    padding: '10px',
    borderRadius: '3px',
  },
});

function HomePage({
  initialContestResults,
  initialAllCandidates,
  initialQuery,
}) {
  const classes = useStyles();

  const router = useRouter();

  const [candidateFilter, setCandidateFilter] = useState(
    router.query?.candidate || null,
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

  const { data: allCandidates } = useSWR(`/api/all_candidates`, fetcher, {
    revalidateOnFocus: false,
    initialData:
      JSON.stringify(router.query) === initialQuery
        ? initialAllCandidates
        : null,
  });

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
  };

  const candidateOptions = [];
  const selectedCandidateFilter = [];
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

  if (allCandidates) {
    for (const candidate of allCandidates) {
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

  return (
    <div className={classes.container}>
      <h1>San Francisco Election Results</h1>
      <div className={classes.filters}>
        <span className={classes.typeaheadLabel}>People who voted for</span>
        <Typeahead
          id="candidate-filter-typeahead"
          className={classes.typeahead}
          onChange={changeCandidateFilter}
          options={candidateOptions}
          placeholder="anyone"
          positionFixed
          selected={selectedCandidateFilter}
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
