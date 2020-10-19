import React from 'react';
import { createUseStyles } from 'react-jss';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import getVotes from 'src/votes';
import Contest from 'src/components/Contest';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export async function getServerSideProps({ query }) {
  const data = await getVotes({ query });
  return { props: { data } };
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

function HomePage({ data: initialData }) {
  const classes = useStyles();

  const router = useRouter();

  const queryString = new URLSearchParams(router.query).toString();
  const { data } = useSWR(`/api/votes?${queryString}`, fetcher, {
    revalidateOnFocus: false,
    initialData,
  });

  if (!data) {
    return <div></div>;
  }

  const groupedContests = data.reduce((arr, contest) => {
    if (arr.length === 0) {
      arr.push([contest]);
    } else if (arr[arr.length - 1].length === 2) {
      arr.push([contest]);
    } else {
      arr[arr.length - 1].push(contest);
    }
    return arr;
  }, []);
  console.log(groupedContests);

  return (
    <div>
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
