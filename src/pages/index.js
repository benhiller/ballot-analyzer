import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import { getCandidates, getVotes } from 'src/data';
import Contest from 'src/components/Contest';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export async function getServerSideProps({ query }) {
  const initialData = await getVotes(query);
  const initialCandidateData = await getCandidates();
  return {
    props: {
      initialData,
      initialQuery: JSON.stringify(query),
      initialCandidateData,
    },
  };
}

const useStyles = createUseStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  contest: {
    flex: 1,
    border: '1px solid #f8f8f8',
  },
});

function HomePage({ initialData, initialQuery, initialCandidateData }) {
  const classes = useStyles();

  const router = useRouter();

  const [candidateFilter, setCandidateFilter] = useState(
    router.query?.candidate || '',
  );

  const queryString = new URLSearchParams(router.query).toString();
  const { data } = useSWR(`/api/votes?${queryString}`, fetcher, {
    revalidateOnFocus: false,
    initialData:
      JSON.stringify(router.query) === initialQuery ? initialData : null,
  });

  const { data: candidateData } = useSWR(`/api/candidates`, fetcher, {
    revalidateOnFocus: false,
    initialData: initialCandidateData,
  });

  const changeCandidateFilter = (candidateFilter) => {
    setCandidateFilter(candidateFilter);
    if (candidateFilter) {
      router.push(`/?candidate=${candidateFilter}`, undefined, {
        shallow: true,
      });
    } else {
      router.push(`/`, undefined, { shallow: true });
    }
  };

  let groupedContests = [];
  if (data) {
    groupedContests = data.reduce((arr, contest) => {
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

  return (
    <div>
      <h1>San Francisco Election Results</h1>
      <div>
        People who voted for{' '}
        <input
          type="text"
          value={candidateFilter}
          placeholder="anyone"
          onChange={(e) => changeCandidateFilter(e.target.value)}
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
