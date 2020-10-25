require('dotenv').config();

const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(process.argv[2]);
const dstDir = path.resolve(process.argv[3]);

const readJSON = async (dir, filename) => {
  const jsonPath = path.join(dir, filename);
  let data;

  try {
    data = await fs.promises.readFile(jsonPath, 'utf8');
  } catch (err) {
    console.log(`Couldn't read file ${filename}`);
    return {};
  }

  return JSON.parse(data);
};

const generateDistrictPrecinctPortionMap = async () => {
  const [
    srcPrecinctPortions,
    srcDistrictPrecinctMap,
    dstPrecinctPortions,
  ] = await Promise.all([
    readJSON(srcDir, 'PrecinctPortionManifest.json'),
    readJSON(srcDir, 'DistrictPrecinctPortionManifest.json'),
    readJSON(dstDir, 'PrecinctPortionManifest.json'),
  ]);

  const dstAssocs = [];
  for (const dstPrecinct of dstPrecinctPortions.List) {
    const precinctIds = [...dstPrecinct.Description.matchAll(/[0-9]+/g)];
    if (precinctIds.length === 0) {
      console.error(
        "Couldn't identify precinct number for destination precinct",
        dstPrecinct,
      );
      continue;
    }

    const srcPrecincts = srcPrecinctPortions.List.filter((srcPrecinct) =>
      precinctIds.some((dstPrecinctId) =>
        srcPrecinct.Description.includes(dstPrecinctId),
      ),
    ).map((precinct) => precinct.Id);

    if (srcPrecincts.length === 0) {
      console.error(
        "Couldn't find destination precinct in source file!",
        dstPrecinct,
      );
      continue;
    }

    const assocs = srcDistrictPrecinctMap.List.filter((assoc) =>
      srcPrecincts.includes(assoc.PrecinctPortionId),
    );

    for (const assoc of assocs) {
      dstAssocs.push({
        DistrictId: assoc.DistrictId,
        PrecinctPortionId: dstPrecinct.Id,
      });
    }
  }

  const dstDistrictPrecinctPortionMap = {
    ...srcDistrictPrecinctMap,
    List: dstAssocs,
  };

  const dstDistrictPrecinctPortionMapData = JSON.stringify(
    dstDistrictPrecinctPortionMap,
  );

  const dstPath = path.join(dstDir, 'DistrictPrecinctPortionManifest.json');
  await fs.promises.writeFile(
    dstPath,
    dstDistrictPrecinctPortionMapData,
    'utf8',
  );
};

generateDistrictPrecinctPortionMap().catch((err) => {
  console.error('Script failed!', err);
});
