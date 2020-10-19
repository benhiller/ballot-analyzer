import React from 'react';

import useSWR from 'swr';

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
            {candidate.candidate_name} {candidate.votes / totalVotes}
          </li>
        ))}
      </ul>
    </div>
  );
};

function HomePage() {
  const { data } = useSWR('/api/votes', fetcher);
  console.log(data);

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
