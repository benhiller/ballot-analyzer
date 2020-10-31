export const capitalizeName = (name) => {
  return name
    .split(' ')
    .map((token) => {
      if (token === 'BART') {
        return token;
      }

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

export const shouldRenderDistrict = ({ type }) => {
  return (
    type !== 'Countywide' &&
    type !== 'County Wide' &&
    type !== 'CITY OF S.F.' &&
    type !== 'STATE' &&
    type !== 'State Senator' &&
    type !== 'Board of Equalization (State)' &&
    type !== 'San Francisco Countywide'
  );
};

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const humanReadableDistrict = ({ name, type }) => {
  switch (type) {
    case 'United States Representative': {
      const district = name.split(' ')[0];
      return `${district.toLowerCase()} Congressional District`;
    }
    case 'Member of the State Assembly': {
      const district = name.split(' ')[0];
      return `${district.toLowerCase()} State Assembly District`;
    }
    case 'County Supervisor': {
      const district = name.split(' ')[2];
      return `${ordinal(parseInt(district))} Supervisorial District`;
    }
    case 'BART': {
      const district = name.split(' ')[2];
      return `${ordinal(parseInt(district))} BART District`;
    }
    case 'Neighborhood':
      switch (name) {
        case 'BAYVW/HTRSPT':
          return 'Bayview\u2014Hunters Point';
        case 'CHINA':
          return 'Chinatown';
        case 'CVC CTR/DWTN':
          return 'Civic Center/Downtown';
        case 'DIAMD HTS':
          return 'Diamond Heights';
        case 'EXCELSIOR':
          return 'Excelsior';
        case 'HAIGHT ASH':
          return 'Haight Ashbury';
        case 'INGLESIDE':
          return 'Ingleside';
        case 'INNER SUNSET':
          return 'Inner Sunset';
        case 'LAKE MERCED':
          return 'Lake Merced';
        case 'LRL HTS/ANZA':
          return 'Laurel Heights/Anza';
        case 'MAR/PAC HTS':
          return 'Marina/Pacific Heights';
        case 'MISSION':
          return 'Mission';
        case 'N BERNAL HTS':
          return 'North Bernal Heights';
        case 'N EMBRCDRO':
          return 'North Embarcadero';
        case 'NOE VALLEY':
          return 'Noe Valley';
        case 'PORTOLA':
          return 'Portola';
        case 'POTRERO HILL':
          return 'Potrero Hill';
        case 'RICHMOND':
          return 'Richmond';
        case 'S BERNAL HTS':
          return 'Bernal Heights';
        case 'SECLF/PREHTS':
          return 'Sea Cliff/Presidio Heights';
        case 'SOMA':
          return 'SOMA';
        case 'SUNSET':
          return 'Sunset';
        case 'UPRMKT/EURKA':
          return 'Upper Market/Eureka Valley';
        case 'VISITA VLY':
          return 'Visitacion Valley';
        case 'W TWIN PKS':
          return 'West of Twin Peaks';
        case 'WST ADDITION':
          return 'Western Addition';
      }
  }
  return name;
};
