const csv = require('csvtojson');
const seedrandom = require('seedrandom');
const fs = require('fs');

const TOTAL_SLOTS = 1600;
const MAX_ECOSYSTEM_WINNERS = 1500;

const SEED = '824';
const rand = seedrandom(SEED);

(async function main() {
  const winners = [];
  const diff = [];

  let ecosystemParticipants = await csv().fromFile('./ecosystem.csv');
  while (
    winners.length < MAX_ECOSYSTEM_WINNERS &&
    ecosystemParticipants.length > 0
  ) {
    const totalEntries = ecosystemParticipants.reduce(
      (total, p) => total + parseInt(p.entries),
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
    winners.push({
      addie: ecosystemParticipants[winnerIndex].address,
      type: 'ecosystem',
    });
    if (winnerIndex >= 1500) {
      diff.push({
        addie: ecosystemParticipants[winnerIndex].address,
        type: 'ecosystem',
      });
    }
    ecosystemParticipants = [
      ...ecosystemParticipants.slice(0, winnerIndex),
      ...ecosystemParticipants.slice(winnerIndex + 1),
    ];
  }

  // To check if address has won to not be chosen again
  const winnerCache = winners.reduce(
    (cache, winner) => Object.assign({}, cache, { [winner.addie]: {} }),
    {},
  );
  let testnetParticipants = await csv().fromFile('./testnet.csv');
  // removed addresses that have already won
  testnetParticipants = testnetParticipants.filter(
    (p) => !winnerCache[p.address],
  );
  while (winners.length < TOTAL_SLOTS && testnetParticipants.length > 0) {
    const totalEntries = testnetParticipants.reduce(
      (total, p) => total + parseInt(p.entries),
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
    winners.push({
      addie: testnetParticipants[winnerIndex].address,
      type: 'testnet',
    });
    if (winnerIndex >= 1500) {
      diff.push({
        addie: testnetParticipants[winnerIndex].address,
        type: 'testnet',
      });
    }
    testnetParticipants = [
      ...testnetParticipants.slice(0, winnerIndex),
      ...testnetParticipants.slice(winnerIndex + 1),
    ];
  }

  fs.writeFileSync(
    './tmp/results.csv',
    `Address,Count,Remarks\n${winners
      .map((w) => `${w.addie},2,${w.type}`)
      .join('\n')}`,
  );
  fs.writeFileSync(
    './tmp/diff.csv',
    `Address,Count,Remarks\n${diff
      .map((w) => `${w.addie},2,${w.type}`)
      .join('\n')}`,
  );
})();
