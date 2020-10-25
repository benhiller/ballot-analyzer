import React from 'react';
import { Highlighter, Menu, MenuItem } from 'react-bootstrap-typeahead';

const CandidateTypeaheadMenu = (candidates, menuProps, state) => {
  if (candidates.length === 0) {
    return <Menu {...menuProps} />;
  }

  let paginationOption = null;
  const candidatesByElection = candidates.reduce((acc, c) => {
    if (c.paginationOption) {
      paginationOption = c;
      return acc;
    }

    if (acc[c.contestName]) {
      acc[c.contestName].push(c);
    } else {
      acc[c.contestName] = [c];
    }

    return acc;
  }, {});

  let index = 0;
  return (
    <Menu {...menuProps}>
      {Object.keys(candidatesByElection).map((contest) => {
        return (
          <React.Fragment key={contest}>
            {index !== 0 && <Menu.Divider />}
            <Menu.Header>{contest}</Menu.Header>
            {candidatesByElection[contest].map((candidate) => {
              const item = (
                <MenuItem
                  option={candidate}
                  position={index}
                  key={candidate.id}
                >
                  <Highlighter search={state.text}>
                    {candidate.menuLabel}
                  </Highlighter>
                </MenuItem>
              );
              index += 1;
              return item;
            })}
          </React.Fragment>
        );
      })}
      {paginationOption && (
        <>
          <Menu.Divider />
          <MenuItem
            option={paginationOption}
            position={index}
            className="rbt-menu-pagination-option"
            label={'Display additional results...'}
          >
            Display additional results...
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default CandidateTypeaheadMenu;
