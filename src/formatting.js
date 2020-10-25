export const capitalizeName = (name) => {
  return name
    .split(' ')
    .map((token) => {
      let capitalizedToken = '';
      let foundAlpha = false;
      for (const char of token.split('')) {
        if (!foundAlpha && /[a-z]/i.test(char)) {
          // Only set foundAlpha when we find an a-z char, so we capitalize the
          // first alphabetical character in nicknames like "Rocky"
          capitalizedToken += char.toUpperCase();
          foundAlpha = true;
        } else if (char === '.' || char === "'" || char === '-') {
          // Reset foundAlpha to handle names like J.R. or O'Meara
          foundAlpha = false;
          capitalizedToken += char.toLowerCase();
        } else {
          capitalizedToken += char.toLowerCase();
        }
      }
      return capitalizedToken;
    })
    .join(' ');
};

const humanReadableParty = (partyName) => {
  switch (partyName) {
    case 'DEM':
      return 'Democratic';
    case 'REP':
      return 'Republican';
    case 'AI':
      return 'American Indepdenent';
    case 'GRN':
      return 'Green';
    case 'P&F':
      return 'Peace and Freedom';
    case 'LIB':
      return 'Libertarian';
    default:
      return partyName;
  }
};

export const humanReadableContest = (name) => {
  if (name.startsWith('President')) {
    const party = name.slice('President '.length);

    return `${humanReadableParty(party)} Presidential Primary`;
  } else if (name.startsWith('US House of Rep')) {
    const district = name.slice('US House of Rep '.length);

    return `US House of Representatives - ${district}`;
  } else if (name.startsWith('CCC')) {
    const districtAndParty = name.slice('CCC '.length);
    const matches = districtAndParty.match(/(District [0-9]+) ([a-z]*)/i);
    const district = matches[1];
    const party = matches[2];
    return `${humanReadableParty(
      party,
    )} County Central Committee - ${district}`;
  }

  return capitalizeName(name);
};

export const alternativeContestNames = (name) => {
  if (name.toLowerCase().startsWith('proposition')) {
    return ['prop ' + name.match(/proposition ([0-9a-z]+)/i)[1]];
  }

  return [];
};
