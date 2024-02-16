const csv = require('csvtojson');
const seedrandom = require('seedrandom');
const fs = require('fs');

const TOTAL_SLOTS = 1600;
const MAX_ECOSYSTEM_WINNERS = 1500;

// TODO: Run seed generation in an AMA
const SEED = '69420';
const rand = seedrandom(SEED);

(async function main() {
  const winners = [];

  // TODO: Replace file with records after lottery closes
  let ecosystemParticipants = await csv().fromFile('./ecosystem.csv');
  while (
    winners.length < MAX_ECOSYSTEM_WINNERS &&
    ecosystemParticipants.length > 0
  ) {
    const totalEntries = ecosystemParticipants.reduce(
      (total, p) => total + p.entries,
      0,
    );
    let winningEntry = rand() * totalEntries;
    let winnerIndex = 0;
    for (let i = 0; i < ecosystemParticipants.length; i++) {
      winningEntry -= ecosystemParticipants[i].entries;
      if (winningEntry < 0) {
        winnerIndex = i;
        break;
      }
    }
    winners.push(ecosystemParticipants[winnerIndex].address);
    ecosystemParticipants = [
      ...ecosystemParticipants.slice(0, winnerIndex),
      ...ecosystemParticipants.slice(winnerIndex + 1),
    ];
  }

  // To check if address has won to not be chosen again
  const winnerCache = winners.reduce(
    (cache, addie) => Object.assign({}, cache, { [addie]: {} }),
    {},
  );
  // TODO: Replace file with records after lottery closes
  let testnetParticipants = await csv().fromFile('./testnet.csv');
  // removed addresses that have already won
  testnetParticipants = testnetParticipants.filter(
    (p) => !winnerCache[p.address],
  );
  while (winners.length < TOTAL_SLOTS && testnetParticipants.length > 0) {
    const totalEntries = testnetParticipants.reduce(
      (total, p) => total + p.entries,
      0,
    );
    let winningEntry = rand() * totalEntries;
    let winnerIndex = 0;
    for (let i = 0; i < testnetParticipants.length; i++) {
      winningEntry -= testnetParticipants[i].entries;
      if (winningEntry < 0) {
        winnerIndex = i;
        break;
      }
    }
    winners.push(testnetParticipants[winnerIndex].address);
    testnetParticipants = [
      ...testnetParticipants.slice(0, winnerIndex),
      ...testnetParticipants.slice(winnerIndex + 1),
    ];
  }

  fs.writeFileSync('./tmp/results.csv', `winners\n${winners.join('\n')}`);
})();
