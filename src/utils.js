export const computeTotalVotes = (candidates) =>
  candidates.reduce((acc, candidate) => acc + candidate.votes, 0);
