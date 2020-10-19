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

  const groupedContestIds = Object.keys(data).reduce((arr, contestId) => {
    console.log(arr);
    if (arr.length === 0) {
      arr.push([contestId]);
    } else if (arr[arr.length - 1].length === 2) {
      arr.push([contestId]);
    } else {
      arr[arr.length - 1].push(contestId);
    }
    return arr;
  }, []);

  // TODO - filter contests where all candidates have 0 votes
  return (
    <div>
      {groupedContestIds.map((contestIds, idx) => (
        <div key={idx} className={classes.row}>
          {contestIds.map((contestId) => (
            <div key={contestId} className={classes.contest}>
              <Contest candidates={data[contestId]} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default HomePage;
