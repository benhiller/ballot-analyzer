import React from 'react';

import useSWR from 'swr';

import getVotes from '../votes';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const Contest = ({ candidates }) => {
  candidates.sort((c1, c2) => c2.votes - c1.votes);
  const totalVotes = candidates.reduce(
    (acc, candidate) => acc + candidate.votes,
    0,
  );
  return (
    <div>
      {candidates[0].contest_name}
      <ul>
        {candidates.map((candidate) => (
          <li key={candidate.candidate_id}>
            {candidate.candidate_name}{' '}
            {((candidate.votes / totalVotes) * 100).toFixed(2)}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export async function getServerSideProps() {
  const data = await getVotes();
  return { props: { data } };
}

function HomePage({ data: initialData }) {
  const { data } = useSWR('/api/votes', fetcher, {
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
