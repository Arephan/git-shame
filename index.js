import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitShame {
  constructor(repoPath = '.') {
    this.repoPath = repoPath;
  }

  async getShameScores() {
    try {
      const log = await this.getGitLog();
      const commits = this.parseCommits(log);
      
      // Detect reverts (commit messages containing "Revert" or "revert")
      const reverts = commits.filter(c => 
        c.message.toLowerCase().includes('revert') ||
        c.message.toLowerCase().includes('fix:') ||
        c.message.toLowerCase().includes('hotfix')
      );

      // Detect CI failures (look for commit messages mentioning failures/errors)
      const ciFailures = commits.filter(c =>
        c.message.toLowerCase().includes('ci') ||
        c.message.toLowerCase().includes('fix') ||
        c.message.toLowerCase().includes('emergency')
      );

      // Build shame scores
      const scores = {};
      const details = {};

      // Count reverts per author
      reverts.forEach(c => {
        scores[c.author] = (scores[c.author] || 0) + 10;
        if (!details[c.author]) details[c.author] = { reverts: 0, fixes: 0, changes: 0 };
        details[c.author].reverts++;
      });

      // Count CI failures per author
      ciFailures.forEach(c => {
        scores[c.author] = (scores[c.author] || 0) + 5;
        if (!details[c.author]) details[c.author] = { reverts: 0, fixes: 0, changes: 0 };
        details[c.author].fixes++;
      });

      // Count total commits (lower = more focused)
      commits.forEach(c => {
        if (!details[c.author]) details[c.author] = { reverts: 0, fixes: 0, changes: 0 };
        details[c.author].changes++;
      });

      return {
        leaderboard: Object.entries(scores)
          .sort(([, a], [, b]) => b - a)
          .map(([author, score], rank) => ({
            rank: rank + 1,
            author,
            score,
            ...details[author]
          })),
        timestamp: new Date().toISOString(),
        totalCommits: commits.length
      };
    } catch (error) {
      throw new Error(`Failed to analyze git history: ${error.message}`);
    }
  }

  async getGitLog() {
    try {
      const { stdout } = await execAsync(
        'git log --pretty=format:"%H|%an|%ae|%s" --all -100',
        { cwd: this.repoPath }
      );
      return stdout;
    } catch {
      return '';
    }
  }

  parseCommits(log) {
    return log
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, author, email, ...messageParts] = line.split('|');
        return {
          hash,
          author: author || 'unknown',
          email: email || '',
          message: messageParts.join('|') || ''
        };
      });
  }

  async getCIFailureStats() {
    // Get commits that broke builds (simulated via conventional commits)
    const log = await this.getGitLog();
    const commits = this.parseCommits(log);
    
    const breakingCommits = commits.filter(c => {
      // Look for signs of breaking changes or emergency fixes
      const msg = c.message.toLowerCase();
      return msg.includes('break') || 
             msg.includes('emergency') || 
             msg.includes('hotfix') ||
             msg.includes('rollback');
    });

    return {
      totalBreaking: breakingCommits.length,
      byAuthor: commits.reduce((acc, c) => {
        const msg = c.message.toLowerCase();
        if (msg.includes('break') || msg.includes('emergency')) {
          acc[c.author] = (acc[c.author] || 0) + 1;
        }
        return acc;
      }, {})
    };
  }

  async getRevertStats() {
    const log = await this.getGitLog();
    const commits = this.parseCommits(log);
    
    const revertCommits = commits.filter(c => 
      c.message.toLowerCase().includes('revert')
    );

    return {
      totalReverts: revertCommits.length,
      byAuthor: revertCommits.reduce((acc, c) => {
        acc[c.author] = (acc[c.author] || 0) + 1;
        return acc;
      }, {}),
      recentReverts: revertCommits.slice(0, 5)
    };
  }

  async getStreak(author) {
    // Count consecutive commits without reverts/breaks
    const log = await this.getGitLog();
    const commits = this.parseCommits(log)
      .filter(c => c.author === author);
    
    let streak = 0;
    for (let i = 0; i < commits.length; i++) {
      const msg = commits[i].message.toLowerCase();
      if (msg.includes('revert') || msg.includes('rollback')) {
        break;
      }
      streak++;
    }
    
    return streak;
  }

  async getHallOfShame(limit = 10) {
    const scores = await this.getShameScores();
    return scores.leaderboard.slice(0, limit);
  }

  async getHallOfFame(limit = 10) {
    // Authors with most commits and no reverts
    const log = await this.getGitLog();
    const commits = this.parseCommits(log);
    
    const authorStats = {};
    commits.forEach(c => {
      if (!authorStats[c.author]) {
        authorStats[c.author] = { commits: 0, reverts: 0 };
      }
      authorStats[c.author].commits++;
      
      if (c.message.toLowerCase().includes('revert')) {
        authorStats[c.author].reverts++;
      }
    });

    return Object.entries(authorStats)
      .map(([author, stats]) => ({
        author,
        commits: stats.commits,
        reverts: stats.reverts,
        quality: stats.commits > 0 ? ((stats.commits - stats.reverts) / stats.commits * 100).toFixed(1) : 0
      }))
      .filter(s => s.commits >= 5) // Only count meaningful contributors
      .sort((a, b) => parseFloat(b.quality) - parseFloat(a.quality))
      .slice(0, limit);
  }
}
