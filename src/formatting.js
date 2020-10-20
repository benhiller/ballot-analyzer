export function capitalizeName(name) {
  return name
    .split(' ')
    .map((token) => {
      if (token.length === 0) {
        return token;
      } else if (token.length === 1) {
        return token.toUpperCase();
      } else {
        return token[0].toUpperCase() + token.slice(1).toLowerCase();
      }
    })
    .join(' ');
}

export function humanReadableContest(name) {
  if (name.startsWith('President')) {
    const party = name.slice('President '.length);

    let humanReadableParty = party;
    switch (party) {
      case 'DEM':
        humanReadableParty = 'Democratic';
        break;
      case 'REP':
        humanReadableParty = 'Republican';
        break;
      case 'AI':
        humanReadableParty = 'American Indepdenent';
        break;
      case 'GRN':
        humanReadableParty = 'Green';
        break;
      case 'P&F':
        humanReadableParty = 'Peace and Freedom';
        break;
      case 'LIB':
        humanReadableParty = 'Libertarian';
        break;
    }

    return `${humanReadableParty} Presidential Primary`;
  }

  return name;
}
