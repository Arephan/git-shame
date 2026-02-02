#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import Table from 'cli-table3';
import { GitShame } from './index.js';

const shame = new GitShame('.');

async function printLeaderboard(data) {
  const table = new Table({
    head: [
      chalk.red.bold('🔴 RANK'),
      chalk.red.bold('AUTHOR'),
      chalk.red.bold('SHAME SCORE'),
      chalk.red.bold('REVERTS'),
      chalk.red.bold('FIXES'),
      chalk.red.bold('TOTAL COMMITS')
    ],
    style: { head: [], border: ['cyan'] },
    wordWrap: true
  });

  data.leaderboard.forEach(entry => {
    const emoji = entry.rank === 1 ? '🏆' : entry.rank <= 3 ? '🥇' : '😅';
    table.push([
      chalk.red.bold(`${emoji} #${entry.rank}`),
      chalk.yellow(entry.author),
      chalk.red.bold(entry.score.toString()),
      chalk.red(entry.reverts.toString()),
      chalk.red(entry.fixes.toString()),
      chalk.gray(entry.changes.toString())
    ]);
  });

  console.log('\n' + chalk.red.bold('═══════════════════════════════════════════════════════════'));
  console.log(chalk.red.bold('🔴 GIT SHAME - HALL OF SHAME 🔴'));
  console.log(chalk.red.bold('═══════════════════════════════════════════════════════════\n'));
  console.log(table.toString());
  console.log(chalk.gray(`\n📊 Total commits analyzed: ${data.totalCommits}`));
  console.log(chalk.gray(`⏰ Updated: ${new Date(data.timestamp).toLocaleString()}\n`));
}

async function printCIStats() {
  const stats = await shame.getCIFailureStats();
  
  console.log(chalk.red.bold('\n🚨 CI FAILURE STATS 🚨\n'));
  
  if (stats.totalBreaking === 0) {
    console.log(chalk.green('✅ No CI-breaking commits detected! Great work!\n'));
    return;
  }

  const table = new Table({
    head: [chalk.red.bold('AUTHOR'), chalk.red.bold('BREAKING COMMITS')],
    style: { head: [], border: ['cyan'] }
  });

  Object.entries(stats.byAuthor)
    .sort(([, a], [, b]) => b - a)
    .forEach(([author, count]) => {
      table.push([chalk.yellow(author), chalk.red.bold(count.toString())]);
    });

  console.log(table.toString());
  console.log();
}

async function printRevertStats() {
  const stats = await shame.getRevertStats();
  
  console.log(chalk.red.bold('\n↩️  REVERT STATS ↩️\n'));
  
  if (stats.totalReverts === 0) {
    console.log(chalk.green('✅ No reverts detected! Pristine history!\n'));
    return;
  }

  const table = new Table({
    head: [chalk.red.bold('AUTHOR'), chalk.red.bold('REVERTS')],
    style: { head: [], border: ['cyan'] }
  });

  Object.entries(stats.byAuthor)
    .sort(([, a], [, b]) => b - a)
    .forEach(([author, count]) => {
      table.push([chalk.yellow(author), chalk.red.bold(count.toString())]);
    });

  console.log(table.toString());
  
  if (stats.recentReverts.length > 0) {
    console.log(chalk.gray('\n📝 Recent reverts:'));
    stats.recentReverts.forEach(c => {
      console.log(chalk.gray(`   • ${c.author}: "${c.message}"`));
    });
  }
  console.log();
}

async function printFame() {
  const fame = await shame.getHallOfFame();
  
  console.log(chalk.green.bold('\n🌟 HALL OF FAME 🌟\n'));
  
  if (fame.length === 0) {
    console.log(chalk.gray('No eligible contributors yet. Keep it up!\n'));
    return;
  }

  const table = new Table({
    head: [
      chalk.green.bold('RANK'),
      chalk.green.bold('AUTHOR'),
      chalk.green.bold('QUALITY %'),
      chalk.green.bold('COMMITS'),
      chalk.green.bold('REVERTS')
    ],
    style: { head: [], border: ['cyan'] }
  });

  fame.forEach((entry, idx) => {
    const emoji = idx === 0 ? '👑' : idx === 1 ? '⭐' : '✨';
    table.push([
      chalk.green.bold(`${emoji} #${idx + 1}`),
      chalk.green(entry.author),
      chalk.green.bold(`${entry.quality}%`),
      chalk.gray(entry.commits.toString()),
      chalk.gray(entry.reverts.toString())
    ]);
  });

  console.log(table.toString());
  console.log();
}

yargs(hideBin(process.argv))
  .command('shame', 'Show hall of shame (default)', {}, async () => {
    try {
      const data = await shame.getShameScores();
      await printLeaderboard(data);
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  })
  .command('ci', 'Show CI failure stats', {}, async () => {
    try {
      await printCIStats();
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  })
  .command('reverts', 'Show revert statistics', {}, async () => {
    try {
      await printRevertStats();
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  })
  .command('fame', 'Show hall of fame (quality contributors)', {}, async () => {
    try {
      await printFame();
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  })
  .command('streak <author>', 'Show commit streak for author', {
    author: { describe: 'Author name', type: 'string' }
  }, async (argv) => {
    try {
      const streak = await shame.getStreak(argv.author);
      console.log(chalk.bold(`\n🔥 ${argv.author} has a ${chalk.red.bold(streak)} commit streak!\n`));
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  })
  .command('json', 'Output as JSON', {}, async () => {
    try {
      const data = await shame.getShameScores();
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  })
  .command('all', 'Show all stats (shame + CI + reverts + fame)', {}, async () => {
    try {
      const data = await shame.getShameScores();
      await printLeaderboard(data);
      await printCIStats();
      await printRevertStats();
      await printFame();
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  })
  .default('shame')
  .help()
  .alias('h', 'help')
  .alias('v', 'version')
  .version('1.0.0')
  .strict()
  .parse();
