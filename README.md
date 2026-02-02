# 🔴 git-shame

**Hall of Shame** — Gamified git analytics for your team.

See who breaks builds, who reverts most, and who's maintaining code quality. Public leaderboards, streaks, and badges that make code quality fun (and slightly embarrassing 😅).

## Features

✅ **Shame Leaderboard** — Who breaks builds and reverts most?  
✅ **CI Failure Tracking** — Detect commits that cause failures  
✅ **Revert Analytics** — Count who reverts most  
✅ **Hall of Fame** — Celebrate quality contributors  
✅ **Commit Streaks** — Who's on a perfect run?  
✅ **JSON Export** — Integrate with your dashboard  
✅ **Team Visibility** — Make code quality visible to the whole team  

## Why?

Code quality needs incentives. `git-shame` gamifies the process:

- **Public accountability** drives better practices
- **Visible streaks** motivate developers
- **Hall of Fame** celebrates quality
- **Shame scoring** makes reverts transparent

Perfect for team dashboards, retrospectives, and CI/CD pipelines.

## Installation

```bash
npm install -g git-shame
# or
npm install --save-dev git-shame
```

## Usage

### Show Hall of Shame (default)
```bash
git-shame
# or
git-shame shame
```

Output:
```
═══════════════════════════════════════════════════════════
🔴 GIT SHAME - HALL OF SHAME 🔴
═══════════════════════════════════════════════════════════

┌───────────┬──────────────┬────────────────┬─────────┬───────┬─────────────────┐
│ 🔴 RANK   │ AUTHOR       │ SHAME SCORE    │ REVERTS │ FIXES │ TOTAL COMMITS   │
├───────────┼──────────────┼────────────────┼─────────┼───────┼─────────────────┤
│ 🏆 #1     │ alice        │ 45             │ 3       │ 6     │ 42              │
├───────────┼──────────────┼────────────────┼─────────┼───────┼─────────────────┤
│ 🥇 #2     │ bob          │ 30             │ 2       │ 4     │ 38              │
├───────────┼──────────────┼────────────────┼─────────┼───────┼─────────────────┤
│ 😅 #3     │ charlie      │ 15             │ 1       │ 2     │ 25              │
└───────────┴──────────────┴────────────────┴─────────┴───────┴─────────────────┘

📊 Total commits analyzed: 125
⏰ Updated: 2/2/2026, 9:30:45 AM
```

### Show CI Failure Stats
```bash
git-shame ci
```

Shows who's responsible for breaking CI pipelines.

### Show Revert Stats
```bash
git-shame reverts
```

Deep dive into who reverts most and why.

### Hall of Fame (Quality Contributors)
```bash
git-shame fame
```

Celebrate developers with high-quality contributions:
```
🌟 HALL OF FAME 🌟

┌──────────┬──────────────┬────────────────┬───────────┬─────────┐
│ RANK     │ AUTHOR       │ QUALITY %      │ COMMITS   │ REVERTS │
├──────────┼──────────────┼────────────────┼───────────┼─────────┤
│ 👑 #1    │ davina       │ 98.2%          │ 56        │ 1       │
├──────────┼──────────────┼────────────────┼───────────┼─────────┤
│ ⭐ #2    │ eve          │ 96.5%          │ 43        │ 0       │
└──────────┴──────────────┴────────────────┴───────────┴─────────┘
```

### Check Commit Streak
```bash
git-shame streak alice
```

See how many consecutive commits without reverts/breaks.

### Get JSON Output
```bash
git-shame json
```

Perfect for piping to dashboards, Slack bots, or analytics tools:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "author": "alice",
      "score": 45,
      "reverts": 3,
      "fixes": 6,
      "changes": 42
    }
  ],
  "timestamp": "2026-02-02T14:30:45.000Z",
  "totalCommits": 125
}
```

### Show All Stats
```bash
git-shame all
```

Complete picture: shame + CI stats + reverts + fame.

## Use Cases

### 📊 Team Dashboard
Embed git-shame in your company dashboard. Display weekly shame leaderboard to keep quality high.

```javascript
import { GitShame } from 'git-shame';
const shame = new GitShame();
const data = await shame.getShameScores();
// Send to your dashboard
```

### 🤖 Slack Bot Integration
Post daily shame rankings to Slack:
```bash
git-shame json | curl -X POST -d @- https://hooks.slack.com/services/YOUR/WEBHOOK
```

### 🔄 CI/CD Pipeline
Add to your GitHub Actions to track quality metrics over time:
```yaml
- name: Run git-shame
  run: npx git-shame json > shame-report.json
- name: Upload metrics
  uses: actions/upload-artifact@v2
  with:
    name: shame-report
    path: shame-report.json
```

### 📈 Weekly Retrospectives
Print the leaderboard during retrospectives to discuss quality patterns.

## Scoring System

**Shame Score Breakdown:**
- **Revert commit:** +10 points (indicates a bad previous commit)
- **Fix/hotfix commit:** +5 points (indicates urgency/breakage)
- **CI-breaking commit:** +5 points (explicit CI failure)

Lower score = better! 🎯

## Configuration

No config needed! `git-shame` works with any git repo.

Optional: Run in a different directory:
```bash
const shame = new GitShame('/path/to/repo');
```

## What's Analyzed?

- Last **100 commits** across all branches
- Conventional commit prefixes: `fix:`, `revert:`, `hotfix:`
- Commit messages mentioning "Revert", "break", "emergency"

## Why Not Just Use...

| Tool | Shame | Impact | Fun |
|------|--------|--------|-----|
| git log | ❌ | ❌ | ❌ |
| GitHub Insights | ⚠️ | ⚠️ | ❌ |
| **git-shame** | ✅ | ✅ | ✅ |

git-shame is:
- 🎮 Gamified for team engagement
- 📊 Visual leaderboards
- 🚀 Instant CLI + JSON export
- 😊 Makes quality fun, not punishing
- 🔗 Integrates with any tool

## Installation for Teams

Add to `package.json`:
```json
{
  "devDependencies": {
    "git-shame": "^1.0.0"
  },
  "scripts": {
    "shame": "git-shame",
    "shame:all": "git-shame all"
  }
}
```

Then: `npm run shame`

## API

```javascript
import { GitShame } from 'git-shame';

const shame = new GitShame('.');

// Get leaderboard
const scores = await shame.getShameScores();

// Get CI stats
const ciStats = await shame.getCIFailureStats();

// Get revert stats
const reverts = await shame.getRevertStats();

// Get hall of fame
const fame = await shame.getHallOfFame(10);

// Get commit streak
const streak = await shame.getStreak('author-name');
```

## License

MIT

---

**Built for teams that take code quality seriously (but not *too* seriously).**

Share this with your team. Then have fun explaining your shame score. 😅

⭐ **Star on GitHub if you enjoy public accountability!**
