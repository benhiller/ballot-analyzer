export function capitalizeName(name) {
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
        } else if (char === '.' || char === "'") {
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
  } else if (name.startsWith('US House of Rep')) {
    const district = name.slice('US House of Rep '.length);

    return `US House of Representatives - ${district}`;
  }

  return name;
}
