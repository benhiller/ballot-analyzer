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

function HomePage({ data: initialData }) {
  const router = useRouter();

  const queryString = new URLSearchParams(router.query).toString();
  const { data } = useSWR(`/api/votes?${queryString}`, fetcher, {
    revalidateOnFocus: false,
    initialData,
  });

  return (
    <div>
      {data &&
        Object.keys(data).map((contestId) => (
          <Contest key={contestId} candidates={data[contestId]} />
        ))}
    </div>
  );
}

export default HomePage;
