export const getUniversalQueryParams = (query) => {
  return query.election ? { election: query.election } : {};
};

export const hasFiltersApplied = (query) => {
  return !!query.candidate;
};
