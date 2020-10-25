export const getUniversalQueryParams = (query) => {
  return query.election ? { election: query.election } : {};
};

export const queryHasFiltersApplied = (query) => {
  return !!query.candidate || !!query.countingGroup;
};
