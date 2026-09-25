# COMPLETE PRODUCT REDESIGN CONTEXT

> **Product**: CricketHub (Enterprise-Grade Real-Time Cricket Telemetry, Live Match Center & Player Analytics Platform)  
> **Target Audience**: Figma Make AI Designer & Frontend UX Engineering Team  
> **Directive**: Discard the existing visual layout, styling, and color schemes. Redesign the entire application experience from the ground up while preserving and elevating all verified product functionalities, data models, APIs, and user flows.

---

## 1. Product Understanding

### 1.1 Executive Summary
CricketHub is a real-time cricket intelligence and match-tracking platform. It aggregates live ball-by-ball telemetry, instant scorecard computations, international and domestic tour schedules, player career archives, and head-to-head multi-format player comparisons.

The platform serves as both a fast-twitch second-screen companion during live matches and a deep statistical research suite for cricket enthusiasts, analysts, journalists, and fantasy sports strategists.

### 1.2 Core Problem Solved
Traditional sports score apps suffer from:
1. **Cluttered visual noise and intrusive advertisements**: Banner ads, clickbait news, and bet-placement popups that obstruct live match tracking.
2. **Disconnected data silos**: Live scores, series schedules, player bio registries, and comparison tools are fragmented across disparate websites.
3. **Slow or manual updates**: Users are forced to refresh pages manually or wait for slow third-party API polling cycles.
4. **Shallow head-to-head comparison**: Most platforms limit player comparison to flat tables without visual radar profiling, format-segmented metrics, or role-specific normalization (batting vs. bowling).

CricketHub solves this by providing a unified, clean, latency-optimized, and visually engaging telemetry workspace.

### 1.3 Key Entities & Relationships
- **Match**: Identified by `matchId` / slug. Contains status (`live`, `upcoming`, `complete`), format (`Test`, `ODI`, `T20I`, `T20 League`), series/tournament name, venue (stadium, city, country), toss results, day/night flag, start timestamp (standardized to IST), innings score list (runs, wickets, overs, declaration, follow-on), current batting team, live run rate (CRR), required run rate (RRR), target, balls remaining, current active batsmen (striker and non-striker with runs, balls, 4s, 6s, SR), current bowlers (overs, maidens, runs, wickets, economy), current partnership, recent balls array (e.g., `['1', '4', 'W', '0', '6', '1']`), last wicket narrative, win probability index (batting % vs. bowling %), and ball-by-ball commentary events.
- **Scorecard / Innings**: Contains batting scorecard (batter, dismissal description, runs, balls, 4s, 6s, SR), bowling figures (bowler, overs, maidens, runs conceded, wickets taken, economy), fall of wickets list (wicket number, score, batter, over), and extras tally (byes, leg byes, wides, no-balls, penalty).
- **Commentary Event**: Granular ball-by-ball record indexed by over and ball number (`over.ball`), commentary transcript, classification flag (`isFour`, `isSix`, `isWicket`), involved batsman, and involved bowler.
- **Fixture / Schedule Item**: Upcoming match pairing (`team1` vs. `team2`), scheduled date/time, series context, stadium venue, and deep match link.
- **Player**: Indexed by sanitized key. Contains official name, nationality/country, profile image URL, primary playing role (Top-order Batter, Fast Bowler, All-rounder, Wicket-keeper), verified personal biography (born date, birthplace, height, batting style, bowling style, domestic/franchise teams list), official ICC Rankings (Test, ODI, T20I for both Batting and Bowling), and multi-format career statistical matrices across Test, ODI, T20I, and IPL.
  - *Batting Matrix*: Matches, Innings, Not Outs, Runs, Highest Score (HS), Batting Average, Balls Faced, Strike Rate, 100s, 50s, 4s, 6s.
  - *Bowling Matrix*: Matches, Innings, Balls Bowled, Runs Conceded, Wickets Taken, Best Bowling in Innings (BBI), Best Bowling in Match (BBM), Bowling Economy, Bowling Average, Bowling Strike Rate, 4-wicket hauls (4w), 5-wicket hauls (5w), 10-wicket hauls (10w).
- **Favorite / Watchlist**: Polymorphic user bookmark entity categorized as either `match` (pinned live match for quick HUD telemetry) or `player` (saved cricketer profile for instant tracking). Supports both persistent cloud synchronization (MongoDB) and seamless offline client persistence (`localStorage`).

---

## 2. Users & Roles

### 2.1 User Archetypes
1. **The Live-Match Follower (The "Second-Screen" Fan)**
   - *Needs*: Instant ball-by-ball updates, minimal latency, current run-rate vs. required run-rate calculations, live win probability, striker strike rate, and over-by-over ball breakdowns without screen clutter.
   - *Context*: Watching at work, on transit, or lounging in front of TV with laptop/phone.
2. **The Fantasy Sports Competitor & Bettor**
   - *Needs*: Granular player form, match conditions, recent boundary frequency, bowling economy, bowler death-overs performance, and venue-specific scoring trends.
3. **The Cricket Analyst & Sports Journalist**
   - *Needs*: High-density statistical comparison tables across all 4 formats (Test, ODI, T20I, IPL), multi-axis radar charts for player attributes, full scorecard verification, and historic milestone figures.
4. **The Casual Global Follower**
   - *Needs*: Clear match summaries, simplified status badges (who won, who needs how many runs), fixture timetables in local IST time, and quick discovery of marquee rivalries (e.g., India vs. Pakistan, The Ashes).

### 2.2 Permissions & Access Model
- **Public / Unauthenticated**: Full open access to all live matches, detailed scorecards, upcoming schedules, player directory, and head-to-head comparison engine.
- **Personalized Watchlist State**: Automatic dual-layer synchronization. If the database backend is active, favorites persist to MongoDB; if in guest mode or disconnected, zero-friction local storage fallback takes over instantly.

---

## 3. Functional Requirements

### 3.1 Live Scores Feed (`/` or `/?tab=live`)
- **Real-Time Polling & Invalidation**: Autonomous 30-second background polling cycle with manual instant-refresh trigger and visual countdown/stale indicator.
- **Multi-Category Match Filtering**: Segment matches dynamically by status and format:
  - *All Matches*
  - *Live Now* (Matches currently in progress)
  - *Upcoming Fixtures* (Scheduled or toss phase)
  - *Match Results / Completed*
  - *International Tours* (ICC Test Championship, Bilateral ODIs, T20Is)
  - *T20 Leagues* (IPL, PSL, BBL, CPL, Vitality Blast)
- **Inline Match Card Telemetry**:
  - Competing team names, official abbreviations, and country/team badges.
  - Multi-innings score display with declared/follow-on indicators.
  - Granular match condition status (e.g., *"India need 34 runs in 28 balls"*, *"Tea Break - Day 3"*, *"Rain delay"*).
  - Compact live striker & non-striker runs/balls tally.
  - Over trajectory ticker (`recentBalls`: dots, singles, boundaries, wickets with visual badges).
  - Quick bookmarking/pinning toggle.
- **Omnisearch & Query Filter**: Real-time fuzzy filtering of live cards by team, league, venue, or country name.
- **Date Traversal Stepper**: Single-click back/forward date pagination for calendar review.

### 3.2 Deep Match Center (`MatchDetailModal` / Dedicated Match View)
- **High-Frequency Telemetry**: Automatic 15-second polling interval while modal is active.
- **Match HUD Header**:
  - Live state badge (LIVE pulsating indicator, Scheduled, Ended).
  - Match format tag, series name, official venue with city/country, day/night indicator, and toss decision.
  - Dynamic run rate tracker: Current Run Rate (CRR), Required Run Rate (RRR), Target score, Runs needed, Balls remaining.
  - Win Probability Index: Live comparative probability bar (Team A % vs. Team B %).
- **Tab 1: Live Overview & Field Matrix**:
  - *Active Batting Pair*: Striker vs. Non-Striker with runs, balls, 4s, 6s, strike rate, and striker active indicator.
  - *Active Bowler(s)*: Overs bowled, maidens, runs conceded, wickets taken, economy rate, and bowling mark indicator.
  - *Current Partnership*: Runs compiled and balls consumed.
  - *Last Wicket Narrative*: Dismissal method, batter score, and over.
  - *Recent Overs String*: Ball-by-ball sequence for the current and preceding overs.
- **Tab 2: Comprehensive Innings Scorecard**:
  - Innings switcher tabs (1st Innings, 2nd Innings, etc. for multi-innings Test matches).
  - Batting table: Batsman name, dismissal breakdown (e.g., `c Kohli b Bumrah`), runs, balls, 4s, 6s, strike rate.
  - Extras row: Detailed category tally (wides, no-balls, leg-byes, byes, penalty).
  - Total score row: Runs, wickets, overs, run rate.
  - Bowling table: Bowler name, overs, maidens, runs conceded, wickets taken, economy rate.
  - Fall of Wickets (FoW) Timeline: Chronological markers of team score, wicket number, departing batsman, and exact over.
- **Tab 3: Live Commentary Stream**:
  - Reverse-chronological ball-by-ball event feed.
  - Ball metric badge (`Over.Ball`).
  - High-impact event callouts: Wickets highlighted with crimson emphasis, Sixes with electric amethyst, and Fours with emerald.
  - Batter and bowler attribution tags for every ball.

### 3.3 Fixtures & Series Schedule (`/?tab=schedule`)
- **Chronological Tour Calendar**: Grouped by date and tournament.
- **Fixture Metadata**: Participating nations/franchises, match format, start time standardized to IST (Asia/Kolkata), venue stadium, and direct link to match hub.
- **Filter & Search**: Instant keyboard search filtering across team names, series titles, and host stadiums.

### 3.4 Player Analytics & Career Profile (`/?tab=players&player={name}`)
- **Master Player Registry Search**: Instant search matching across 1,100+ verified cricketers with query sanitization and typo-tolerant token matching.
- **Quick-Access Trending Cricketers**: Instant preset selector pills for world-class stars.
- **Athlete Header & Verified Bio**:
  - Official headshot with lazy loading and fallback avatar.
  - Nation badge, player role pill, height, birth date, birthplace.
  - Batting style (e.g., Right-hand bat), bowling style (e.g., Right-arm fast-medium).
  - Franchise and domestic teams roster tags.
  - Direct Cricbuzz verified source link.
  - Add/Remove from Watchlist button.
  - "Compare Player" shortcut CTA.
- **Official ICC Rankings Showcase**:
  - Six-card matrix: Test Batting, ODI Batting, T20I Batting, Test Bowling, ODI Bowling, T20I Bowling rank badges.
- **Interactive Multi-Format Career Matrix**:
  - Format selector: **Test** | **ODI** | **T20I** | **IPL / T20 Leagues**.
  - Discipline toggle: **Batting Performance** vs. **Bowling Performance**.
  - Batting attributes: Matches, Innings, Not Outs, Runs, Highest Score, Average, Balls Faced, Strike Rate, 100s, 50s, 4s, 6s.
  - Bowling attributes: Matches, Innings, Balls, Runs, Wickets, Best Bowling Innings, Best Bowling Match, Economy, Average, Strike Rate, 4w, 5w, 10w.
- **Recharts Radar & Performance Spider**:
  - Normalized multi-axis visual rating showing 5 core attributes (Average, Strike Rate, Centuries, Half-Centuries, Aggregate Runs).

### 3.5 Head-to-Head Player Comparison (`/?tab=compare`)
- **Dual Player Input Matrix**: Side-by-side search fields with deep-link state synchronization (`/?tab=compare&player1=...&player2=...`).
- **Side-by-Side Athlete Profile Cards**: Visual matchup presentation featuring country badges, roles, and bio traits.
- **Synchronized Format & Discipline Controllers**: Seamless switching across Test, ODI, T20I, and IPL formats for Batting or Bowling.
- **Overlapping Dual-Radar Analytics**:
  - Player 1 (Emerald vector) vs. Player 2 (Cyan vector) plotted simultaneously over identical radar axes.
- **Direct Stat Diff Matrix Table**: Side-by-side rows with automated advantage indicators (highlighting the superior average, strike rate, boundary rate, or lower economy).

### 3.6 Personal Watchlist & Pinned Hub (`/?tab=favorites`)
- **Pinned Live Match Spotlight**: Pinned match anchors to the top of the interface for persistent second-screen tracking.
- **Bookmarked Cricketers Roster**: Fast visual cards with one-click access to full career profiles.
- **Quick Unpin & Delete Triggers**: Instant removal with dual MongoDB and client storage synchronization.

### 3.7 Global Spotlight Command Palette (Ctrl+K / Cmd+K)
- **Universal Omni-Search Modal**:
  - Live matches index.
  - Upcoming schedule fixtures index.
  - Direct player profile query launcher.
  - System tab navigation shortcuts.
  - Keyboard navigation (Arrow keys, Enter, Escape).

---

## 4. User Journeys

### Journey 1: Following an Intense Live Cricket Match
```
[User Arrives at Home / Live Tab]
         │
         ▼
[Views Live Match Cards Grid with Real-Time Score & CRR]
         │
         ▼ (User wants persistent tracking of IND vs AUS)
[Clicks "Pin to Spotlight" Icon on IND vs AUS Card]
         │
         ▼
[Match anchors to Top Hero Telemetry Bar with Live Updates]
         │
         ▼ (User wants in-depth over breakdown)
[Clicks "Match Center / Deep Details"]
         │
         ▼
[Match Center Opens: Views Live Batting Pair, Win Prob (72% vs 28%), Recent Balls]
         │
         ▼
[Switches to Scorecard Tab -> Checks Bowler Economy & Fall of Wickets]
         │
         ▼
[Switches to Commentary Tab -> Follows ball-by-ball boundary commentary]
```
*Identified Friction in Existing App*: The match details opened in a heavy modal overlay that obstructed the rest of the application, and did not allow split-screen multi-tasking.  
*Proposed UX Improvement*: A modular drawer/split-panel layout allowing the user to keep the match center open while browsing other fixtures or player bios.

### Journey 2: Researching & Comparing Players for Fantasy League
```
[User Navigates to Player Search]
         │
         ▼
[Types "Travis Head" in Search Palette]
         │
         ▼
[System Fetches Profile -> Displays Bio, ICC Ranks, ODI Batting Avg (43.2), SR (105.4)]
         │
         ▼ (User wants to compare with Rohit Sharma)
[Clicks "Compare With Another Player"]
         │
         ▼
[Transitions to Head-to-Head Comparison Screen with Player 1 Pre-filled]
         │
         ▼
[Types "Rohit Sharma" into Player 2 Input -> Clicks "Compare"]
         │
         ▼
[Dual Radar Chart loads: Overlapping visual metrics for ODI format]
         │
         ▼
[Switches toggle to "T20I" format -> Instant reactive delta re-calculation]
```
*Identified Friction in Existing App*: Users had to re-type both player names manually when navigating between player profile and comparison view.  
*Proposed UX Improvement*: One-click "Compare" action from any player profile that immediately loads a pre-populated comparison canvas with smart adversary suggestions.

---

## 5. Existing Design — TO BE DISCARDED

> **CRITICAL DIRECTIVE**: The visual design below is strictly documented to ensure the redesign **DOES NOT** reproduce or subtly iterate upon it. All items in this section are marked for complete retirement.

* **Existing Color Palette (Discard)**: Generic dark charcoal `#070a12`, generic slate `#0f1626`, emerald `#10b981`, and sky-blue accents.
* **Existing Typography (Discard)**: Stock pairing of Google Fonts `Outfit` for headings and `Plus Jakarta Sans` for body copy.
* **Existing Navbar (Discard)**: Conventional sticky horizontal top bar with generic pills and a mobile bottom bar with stacked icon-labels.
* **Existing Cards (Discard)**: Uniform `#0f1626` rounded cards with `1px solid rgba(255,255,255,0.07)` borders and faint hover glow.
* **Existing Hero (Discard)**: Standard gradient banner with centered text and search inputs.
* **Existing Modal (Discard)**: Full-viewport fixed modal overlay (`MatchDetailModal`) with tab navigation enclosed inside a monolithic scrolling box.
* **Existing Aesthetic (Discard)**: Standard generic dark-mode sports dashboard with stadium radial background gradients.

---

## 6. New Information Architecture

### 6.1 Structural Philosophy: "The Cricket Telemetry Station"
Move away from disjointed modal popups and isolated page tabs. The new architecture is structured around a **Persistent Global Frame with Modular Workspaces**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP COMMAND BAR: Quick Brand | Live Ticker Tape (Compact) | Global Ctrl+K │
├──────────────┬─────────────────────────────────────────────────────────┤
│ PRIMARY RAIL │ WORKSPACE CANVAS                                        │
│ (Icon + Label│                                                         │
│ Navigation)  │  [Context Header: Title, Global Filters, Live State]    │
│              │                                                         │
│ • Match Hub  │  ┌────────────────────────┬───────────────────────────┐ │
│ • Fixtures   │  │ MAIN STAGE             │ TELEMETRY DOCK (Collapsible│
│ • Player Lab │  │ (Cards, Scorecards,    │ (Pinned Match, Live Radar,│ │
│ • Comparison │  │  Analytical Grids)     │  Fantasy Insights, Watch) │ │
│ • Watchlist  │  │                        │                           │ │
│              │  └────────────────────────┴───────────────────────────┘ │
└──────────────┴─────────────────────────────────────────────────────────┘
```

### 6.2 Navigation Model
- **Primary Rail (Left Desktop / Compact Bottom Sheet Mobile)**:
  1. **Match Center (`/live`)**: Live matches, results, and league filters.
  2. **Tour Calendar (`/schedule`)**: Upcoming series, bilateral tours, and venues.
  3. **Player Lab (`/players`)**: Master player directory, bio archives, and format radar.
  4. **Head-to-Head (`/compare`)**: Multi-dimensional dual-player battle engine.
  5. **Watchlist (`/watchlist`)**: Pinned games and tracked athletes.
- **Top Live Ticker Tape**: Compact, single-line horizontal ticker displaying active live games across international and domestic matches with live scores and status. Clicking any ticker immediately mounts the match in the active workspace.
- **Telemetry Dock (Right Side Drawer / Floating PIP)**: Persistent side dock where a user can keep a live match active while simultaneously browsing player stats or comparing players on the main stage.

---

## 7. Three New Design Concepts

### Concept A: "The Broadcast Pressroom" (Editorial & High-Impact Sports Journalism)
- **Design Philosophy**: Evokes the prestige and drama of premium sports journalism (The Athletic, ESPNcricinfo Longform, Financial Times Sport). Generous whitespace, refined typography, and rich narrative hierarchy.
- **Layout Philosophy**: Asymmetrical editorial columns, rich typography with high contrast, and spacious visual breathing room.
- **Navigation Model**: Elegant slim left masthead with Roman numeral numbering and serif accents.
- **Color Direction**: Warm deep paper black (`#0C0D0E`), crisp warm cream surfaces (`#16181A`), archival off-white typography (`#F4F3EF`), accented by heritage Wimbledon green (`#00472F`) and gold leaf (`#D4AF37`).
- **Typography Direction**: Display in high-contrast editorial serif (e.g., `Playfair Display` or `Fraunces`), accompanied by Swiss-style grotesque sans (e.g., `Söhne` or `Cabinet Grotesk`) for data matrices.
- **Card / Content Style**: Subtle hairline cream dividers (`1px solid rgba(244,243,239,0.08)`), flat surfaces without heavy rounded corners, sharp 4px micro-radii.
- **Brand Personality**: Authoritative, historical, timeless, intelligent.
- **Why It Fits**: Appeals to cricket purists and Test match aficionados who value deep statistics, match narratives, and timeless editorial presentation.

### Concept B: "The Quant Pit" (High-Density Financial Terminal & Sports Telemetry)
- **Design Philosophy**: Treats cricket like high-frequency financial telemetry (Bloomberg Terminal, TradingView, Linear, Datadog). Zero fluff, ultra-high information density, monospace data alignments, and instant visual scanning.
- **Layout Philosophy**: Modular multi-pane bento grids, split-screen live telemetry, persistent docking drawers, and dense stat rows.
- **Navigation Model**: Ultra-compact 48px icon rail on the left, top micro-status bar, and command-driven workflows with quick keyboard hotkeys.
- **Color Direction**: Deep charcoal-slate foundation (`#090B10`), cold Obsidian panel surfaces (`#0E121B`), border lines in cyber metallic slate (`#1C2333`), highlighted by electric neon phosphor green (`#00F59B`), hyper-amber for upcoming states (`#FFB300`), and laser crimson for wickets (`#FF2E54`).
- **Typography Direction**: Technical modern grotesque (e.g., `Geist Sans` or `Plus Jakarta Sans` with optical sizing) paired with monospace tabular numerals (e.g., `JetBrains Mono` or `Geist Mono`) for all scores, run-rates, and overs.
- **Card / Content Style**: Sharp precision cards (6px border-radius), dual-tone micro-headers, tabular grid lines, and dense hover state micro-inspectors.
- **Brand Personality**: High-performance, razor-sharp, analytical, engineered.
- **Why It Fits**: Perfect for modern cricket followers, fantasy gamers, and analysts who need immediate, dense, ball-by-ball clarity without decorative distractions.

### Concept C: "The Cyber Stadium" (Atmospheric, Immersive & Neon Gaming Arena)
- **Design Philosophy**: Inspired by modern gaming interfaces, EA Sports FC HUDs, and floodlit stadium night atmospheres. Dynamic illumination, glowing contour lines, high-saturation team accents, and motion-heavy cards.
- **Layout Philosophy**: Centered spotlight arena with curved card carousels, dynamic team-color ambient backdrops, and floating glass HUD overlays.
- **Navigation Model**: Floating island pill navigation floating at bottom center with neon glow borders.
- **Color Direction**: Midnight abyss black (`#050508`), iridescent dark purple-indigo surfaces (`#0F0F1A`), surrounded by high-voltage stadium neon cyan (`#00F0FF`), hot magenta (`#FF0055`), and electric stadium turf green (`#39FF14`).
- **Typography Direction**: Ultra-bold futuristic athletic sans (e.g., `Syne`, `Clash Display`, or `Chakra Petch`) with geometric sans body text.
- **Card / Content Style**: Layered translucent surfaces with neon stroke borders (12px to 16px radius), holographic gradient fills, and subtle outer glow drop-shadows.
- **Brand Personality**: High-octane, electrifying, youthful, arcade-grade excitement.
- **Why It Fits**: Ideal for T20, IPL, and franchise cricket fans who want visual spectacle and emotional energy.

---

## 8. Selected Design Direction

### Selection: Concept B — "The Quant Pit" (Modern Sports Telemetry Terminal)
**Reasoning**:
Cricket is fundamentally a sport of dense numbers, run rates, balls, averages, strike rates, overs, and split-second shifts in win probability.
- **Fulfills the Core User Need**: Whether a user is checking an ongoing IPL run-chase or analyzing Virat Kohli’s Test average in Australia, clarity and density trump decorative ornamentation.
- **Eliminates Modal Traps**: The terminal layout allows a user to dock a live match in the Telemetry Dock while freely querying player archives or fixtures on the main stage.
- **Elevates Modern Frontend Aesthetics**: High-density engineering interfaces (like Linear, Vercel, Supabase, Raycast) represent the pinnacle of modern design — delivering sophisticated aesthetics, razor-sharp typography, and zero visual clutter.

---

## 9. New Design System (Quant Pit / Sports Telemetry)

### 9.1 Color System
```
Token                   Hex Value       Purpose / Usage
─────────────────────────────────────────────────────────────────────────────
--bg-void               #07080C         Application canvas root background
--bg-panel              #0D0F17         Primary module/panel surface
--bg-panel-elevated     #131722         Elevated cards, popovers, dropdowns
--bg-subtle             #1A202E         Pills, stat chips, table row alternate
--border-subtle         #1F2637         Default container boundary hairline
--border-strong         #2E384D         Hover state boundaries & divider lines
--border-focus          #00F59B         Active input / selection halo

--text-primary          #F3F5FA         High-emphasis titles, scores, primary metrics
--text-secondary        #9EA8BD         Labels, subtitles, commentary transcript
--text-muted            #5E677D         Timestamps, unselected tabs, hotkey helpers

--accent-primary        #00F59B         Phosphor Green (Live status, wins, boundary 4s)
--accent-primary-glow   rgba(0,245,155,0.15) Ambient highlight behind live nodes
--accent-secondary      #00B4D8         Cyan Blue (Secondary indicators, bowling radar)
--accent-warning        #FFB300         Amber (Upcoming matches, toss phase, warnings)
--accent-danger         #FF2E54         Laser Crimson (Wickets, out dismissals, alert errors)
--accent-purple         #9D4EDD         Electric Amethyst (Sixes, special milestones)
```

### 9.2 Typography Scale
- **Display Sans**: `Geist Sans` or `Plus Jakarta Sans` with `-0.03em` tracking.
- **Monospace Telemetry**: `JetBrains Mono` or `Geist Mono` for all tabular numerals, scores, overs, run-rates, and balls.

```
Style           Font Weight     Size / Line-Height      Tracking    Usage
─────────────────────────────────────────────────────────────────────────────
Display         Black (900)     32px / 38px             -0.04em     Hero scoreboard, spotlight headlines
H1              ExtraBold (800) 24px / 30px             -0.03em     Page workspace headers
H2              Bold (700)      18px / 24px             -0.02em     Section headers, panel titles
H3 / Subhead    SemiBold (600)  14px / 20px             -0.01em     Team names, player names
Body            Medium (500)    13px / 18px             normal      Commentary, bio details
Caption         Regular (400)   11px / 16px             +0.01em     Timestamps, venues, metadata
Telemetry Mono  Bold (700)      13px / 16px (Mono)      tabular     Scores (e.g. 198/4), overs (18.2)
Micro Mono      Medium (500)    10px / 14px (Mono)      tabular     Run rates, balls, strike rates
```

### 9.3 Spacing Scale & Elevation
- **Spacing Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px.
- **Border Radii**:
  - `sm`: 4px (Chips, ball badges, mini-indicators)
  - `md`: 6px (Buttons, inputs, dropdown items)
  - `lg`: 8px (Panels, match cards, modular bento tiles)
  - `xl`: 12px (Telemetry dock, command palette)
- **Shadows**:
  - `elevation-card`: `0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)`
  - `elevation-floating`: `0 12px 32px -4px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)`

### 9.4 Component Language

#### 1. Telemetry Match Card
- **Structure**: Compact rectangular container with a micro-header (Series title + Match format tag + Live status pill with pulsing indicator).
- **Match Grid**: Dual-row team display. Team badge + Team abbreviation (`IND`) + Team score in large tabular mono (`242/4`) + Overs tag in muted mono (`(38.4)`).
- **Match Narrative**: Bottom strip showing real-time requirement (e.g., *"Need 42 runs in 34 balls • CRR: 6.31 • RRR: 7.41"*).
- **Recent Balls Strip**: Horizontal sequence of 6 rounded pill chips representing recent balls:
  - `.` (Dot ball): Slate muted pill
  - `1`, `2`, `3` (Singles/twos): Light silver pill
  - `4` (Boundary Four): Emerald green border with neon fill
  - `6` (Boundary Six): Purple border with amethyst glow
  - `W` (Wicket): Laser crimson solid pill with white bold lettering

#### 2. Live Telemetry Dock (Split-Screen Companion)
- Replaces the blocking modal. Docked on the right desktop viewport (380px wide) or expandable to full width.
- Sticky HUD at top: Win Probability bar graph with dynamic split (e.g. `68% IND` | `32% AUS`), live striker with strike rate, and active bowler figures.
- Mini segmented tabs: `Overview` | `Scorecard` | `Ball-by-Ball`.

#### 3. Data Tables & Scorecards
- High-density rows with alternating subtle striping.
- Batting columns: Batsman, Dismissal narrative, Runs (Bold mono), Balls, 4s, 6s, Strike Rate (highlighted if >140 in T20 or >80 in ODI).
- Bowling columns: Bowler, Overs, Maidens, Runs conceded, Wickets taken (highlighted in crimson if >=3), Economy rate (color-coded: green if <6.0, amber if 6-9, crimson if >9).

#### 4. Dual-Player Radar Canvas
- Dark polygon canvas with subtle concentric pentagons.
- Player 1 plotted in neon green outline with 20% transparent fill; Player 2 in cyan outline with 20% transparent fill.
- Interactive tooltip showing absolute numerical values when hovering over any axis vertex.

---

## 10. Screen-by-Screen Redesign

### Screen 1: The Live Telemetry Dashboard (`/live`)
- **Primary Goal**: Immediate situational awareness of all ongoing international and domestic cricket matches.
- **Layout Structure**:
  - **Top Bar**: Sticky micro-ticker displaying scores across active matches.
  - **Control Bar**: Format filters (`All`, `Live Now`, `Upcoming`, `Tests`, `ODIs`, `T20 Leagues`, `Results`) + Date picker stepper + Live connection health badge + Instant refresh CTA.
  - **Main Canvas**: Two-tier layout:
    - *Spotlight Hero (If match pinned)*: Wide telemetry monitor with active batter/bowler figures and live win probability.
    - *Match Bento Grid*: 3-column desktop / 1-column mobile grid of Telemetry Match Cards.
  - **Right Telemetry Dock**: Expandable match inspector displaying instant commentary without opening a full-page modal.

### Screen 2: Deep Match Center Workspace (Full Inspection)
- **Primary Goal**: Deep-dive match analysis with synchronized scorecards, full commentary stream, and over-by-over graphs.
- **Layout Structure**:
  - **Match Header Banner**: Split-flap style scoreboard showing both teams, flags, live state, venue, and toss result in IST.
  - **Secondary Sub-Nav**: `Overview & Live Pair` | `Full Scorecard (Innings 1-4)` | `Ball-by-Ball Commentary`.
  - **Content Area**:
    - *When Overview Active*: Batter cards (Striker indicator with radar icon), Bowler figures, Current partnership badge, and Win Probability meter.
    - *When Scorecard Active*: Innings selector tabs, full batting roster, FoW timeline bar, and bowling figures table.
    - *When Commentary Active*: Live stream with milestone tags (WICKET / FOUR / SIX) with auto-scroll lock.

### Screen 3: Upcoming Fixtures & International Tour Calendar (`/schedule`)
- **Primary Goal**: Plan upcoming match viewing with exact match timings converted to local IST time.
- **Layout Structure**:
  - **Header**: Calendar search field (Search team, tournament, venue) + Quick-filter chips (`Bilateral Tours`, `World Cup`, `IPL 2026`, `Test Championship`).
  - **Chronological List**: Grouped by date bands (`Today`, `Tomorrow`, `Next Week`, `October 2026`).
  - **Fixture Card**: Stadium location icon, start time in IST with countdown tag (e.g., *"Starts in 4 hours"*), match format badge, and "Add to Calendar" / "Bookmark" action.

### Screen 4: Player Analytics & Bio Laboratory (`/players`)
- **Primary Goal**: Investigate a player's career records, official ICC rankings, and form trajectory across all 4 formats.
- **Layout Structure**:
  - **Search Spotlight**: Command bar with autocomplete + trending star pills (`Virat Kohli`, `Jasprit Bumrah`, `Travis Head`, `Babar Azam`).
  - **Player Header**: High-resolution athlete portrait, verified nationality badge, role badge, personal biography grid (birthdate, height, batting/bowling style, domestic teams).
  - **ICC Ranking Ribbons**: 6-card ranking overview for Batting and Bowling across Test, ODI, and T20I.
  - **Dual-Panel Analytics Stage**:
    - *Left Stage*: Interactive Multi-Axis Radar Visualizer with format and discipline toggles.
    - *Right Stage*: High-density statistical matrix table displaying matches, runs, average, strike rate, centuries, 5-wicket hauls, and best figures.

### Screen 5: Head-to-Head Comparison Battleground (`/compare`)
- **Primary Goal**: Side-by-side comparative analysis of two cricketers across identical formats.
- **Layout Structure**:
  - **Matchup Selector**: Dual combobox (`Player 1` vs. `Player 2`) with quick preset rivalry buttons (e.g. *"Kohli vs Smith"*, *"Bumrah vs Cummins"*, *"Babar vs Root"*).
  - **Battle Canvas**:
    - Overlapping Dual-Vector Radar Chart.
    - Side-by-side metric comparison table with automated delta highlight (the player leading in each metric gets a green indicator tag).

### Screen 6: Personal Watchlist & Pinned Radar (`/watchlist`)
- **Primary Goal**: Single-click access to the user's pinned match and tracked players.
- **Layout Structure**:
  - **Pinned Match Banner**: High-priority live telemetry bar.
  - **Tracked Cricketers Roster**: Card grid displaying player headshots, primary stats, current form, and fast removal triggers.

---

## 11. Responsive Strategy

### 11.1 Breakpoint System
- **Desktop (>= 1280px)**: Persistent Left Icon-Rail (64px) + Main Content Stage + Right Telemetry Dock (380px).
- **Tablet / Laptop (768px - 1279px)**: Left Rail + Responsive 2-column bento grid. Telemetry Dock converts to an off-canvas slide-out sheet.
- **Mobile (< 768px)**: Bottom Navigation Bar with haptic icon feedback. Single-column card flow. Live match cards convert to a compact swipe carousel.

### 11.2 Key Structural Responsive Transformations
1. **Match Detail Modal -> Fullscreen Sheet with Bottom-Bar HUD**: On mobile, match details open as an upward-sliding bottom sheet with a persistent bottom mini-bar showing the live score and balls remaining.
2. **Dense Multi-Column Stats Tables -> Swipeable Card Matrix**: Multi-column batting tables transform on mobile into horizontally swipeable cards or sticky batsman-name columns with horizontal scrolling for stat metrics (Runs, Balls, SR).
3. **Dual Player Compare -> Stacked Rivalry View**: On desktop, players sit side-by-side; on mobile, the interface stacks with a center "VS" battle medallion and segmented toggle pills.
4. **Spotlight Search (Ctrl+K) -> Bottom Sheet Search**: Fullscreen drawer on mobile with large touch-friendly targets and voice-search / quick-filter tags.

---

## 12. UX Improvements

| # | Friction Area | Existing Behavior | Proposed New UX | Strategic Benefit |
|---|---------------|-------------------|-----------------|-------------------|
| 1 | **Match Detail Discovery** | Opens an all-or-nothing 79KB modal overlay that blocks entire application context. | Modular slide-out **Telemetry Dock** that allows split-screen multi-tasking while browsing other tabs. | User never loses context; can track a live game while researching players. |
| 2 | **Player Search & Compare Hand-off** | User searches a player, then must switch tabs and re-type both player names manually. | Universal **"Compare with..."** action button on every player profile with automatic adversary suggestions. | Reduces friction from 6 manual steps to a single click. |
| 3 | **Score Refresh Feedback** | Generic loading spinner that obscures entire list during refresh. | Subtle **background pulse bar** and relative time counter (e.g., *"Updated 4s ago"*) without layout shift. | Eliminates layout jumpiness and provides confidence in real-time latency. |
| 4 | **Over Breakdown Visibility** | Recent balls hidden inside raw text strings or truncated cards. | Dedicated **Over Telemetry Bead Strip** with visual color-coded badges for 4s (emerald), 6s (purple), and Wickets (crimson). | Enables instantaneous visual comprehension of momentum and boundary bursts. |
| 5 | **Format Confusion** | Test, ODI, and T20 metrics mixed or requiring multiple clicks to compare. | Synchronized **Format Pill Matrix** with instant cross-format tab memory. | Faster navigation with zero cognitive friction. |
| 6 | **Timezone Ambiguity** | Scraped timestamps occasionally showed GMT or mixed formats. | **Standardized Indian Standard Time (IST)** with contextual countdowns (e.g., *"Starts in 45 min"*). | Primary target demographic avoids mental timezone conversions. |
| 7 | **Empty Watchlist Experience** | Plain text saying "No favorites" with empty cards. | High-utility **Discovery Canvas** showcasing trending stars and active live fixtures to pin with one click. | Turns dead-end empty states into active discovery funnels. |
| 8 | **Keyboard Navigation** | Ctrl+K existed but lacked quick keyboard routing shortcuts. | Fully integrated **Command Palette** supporting shortcuts (`/live`, `/compare`, player name auto-fill, Esc to dock). | Power users can navigate the entire platform without touching a mouse. |

---

## 13. Realistic Demo Content

### 13.1 Live Matches
```json
[
  {
    "matchId": "129841",
    "series": "Border-Gavaskar Trophy 2026 - 3rd Test",
    "matchFormat": "TEST",
    "venue": "Melbourne Cricket Ground, Melbourne",
    "status": "Day 4: 2nd Session - India need 74 runs",
    "isLive": true,
    "team1": { "name": "Australia", "shortName": "AUS", "score": "348 & 216", "overs": "68.2" },
    "team2": { "name": "India", "shortName": "IND", "score": "382 & 109/2", "overs": "28.4" },
    "currentInnings": {
      "battingTeam": "India",
      "target": 183,
      "requiredRuns": 74,
      "currentRunRate": "3.80",
      "requiredRunRate": "2.35"
    },
    "currentBatsmen": [
      { "name": "Virat Kohli", "runs": 58, "balls": 74, "fours": 7, "sixes": 1, "strikeRate": "78.37", "isStriker": true },
      { "name": "Shubman Gill", "runs": 36, "balls": 52, "fours": 4, "sixes": 0, "strikeRate": "69.23", "isStriker": false }
    ],
    "currentBowlers": [
      { "name": "Pat Cummins", "overs": "9.4", "maidens": 2, "runs": 34, "wickets": 1, "economy": "3.51", "isBowling": true },
      { "name": "Mitchell Starc", "overs": "8.0", "maidens": 1, "runs": 38, "wickets": 1, "economy": "4.75", "isBowling": false }
    ],
    "recentBalls": ["1", "0", "4", "2", "0", "1"],
    "winProbability": { "battingTeam": "India", "battingTeamProb": 78, "bowlingTeam": "Australia", "bowlingTeamProb": 22 }
  },
  {
    "matchId": "129842",
    "series": "ICC T20 Super Series 2026",
    "matchFormat": "T20I",
    "venue": "Eden Gardens, Kolkata",
    "status": "Innings Break - England need 198 runs to win",
    "isLive": true,
    "team1": { "name": "India", "shortName": "IND", "score": "197/5", "overs": "20.0" },
    "team2": { "name": "England", "shortName": "ENG", "score": "Yet to bat", "overs": "0.0" },
    "recentBalls": ["6", "1", "4", "W", "2", "6"],
    "winProbability": { "battingTeam": "England", "battingTeamProb": 44, "bowlingTeam": "India", "bowlingTeamProb": 56 }
  }
]
```

### 13.2 Player Records (Virat Kohli)
```json
{
  "name": "Virat Kohli",
  "country": "India",
  "role": "Top-order Batter",
  "personalInfo": {
    "born": "Nov 05, 1988 (Age 37)",
    "birthPlace": "Delhi, India",
    "height": "5 ft 9 in (175 cm)",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm medium",
    "teams": ["India", "Royal Challengers Bengaluru", "Delhi"]
  },
  "rankings": {
    "batting": { "test": "6", "odi": "3", "t20": "14" },
    "bowling": { "test": "--", "odi": "--", "t20": "--" }
  },
  "batting_stats": {
    "odi": { "matches": "295", "innings": "283", "runs": "13906", "average": "58.18", "strike_rate": "93.54", "highest": "183", "hundreds": "50", "fifties": "72", "fours": "1294", "sixes": "151" },
    "test": { "matches": "115", "innings": "195", "runs": "8947", "average": "48.89", "strike_rate": "55.60", "highest": "254*", "hundreds": "29", "fifties": "30", "fours": "998", "sixes": "26" }
  }
}
```

---

## 14. FIGMA MAKE MASTER PROMPT

```markdown
# MISSION BRIEF: REDESIGN "CRICKETHUB" FROM SCRATCH (FIGMA MAKE MASTER DIRECTIVE)

You are the Lead Principal Product Designer and Design Systems Architect at a world-class digital product design firm.

I have an existing sports web application called CricketHub.
You must DISCARD its existing visual design, layouts, color choices, and component styling completely.
Do NOT reproduce the old design, do NOT create a generic dark theme dashboard with stadium gradients, and do NOT use basic cards or generic AI templates.

Your goal is to design a completely new, world-class, production-ready product experience called "CricketHub — The Cricket Telemetry Station" built around the "Quant Pit" design philosophy: an ultra-high-performance, high-density sports intelligence and live telemetry terminal (inspired by Linear, Bloomberg Terminal, Datadog, and TradingView).

---

### PRODUCT CONTEXT & VERIFIED REQUIREMENTS

CricketHub is an enterprise-grade live cricket match tracker and statistical analytics platform:
1. Live Scores Telemetry: Real-time ball-by-ball updates, multi-innings scores (Runs/Wickets, Overs), Current Run Rate (CRR), Required Run Rate (RRR), Target, balls remaining, current active batsmen (striker and non-striker with runs, balls, 4s, 6s, SR), current bowlers (O, M, R, W, economy), current partnership, over-by-over bead strip (dots, boundaries, wickets), and live win probability percentage bar.
2. Deep Match Center: Overview with active field pair, full scorecard across all innings (Batting table with dismissal descriptions, Bowling figures, Fall of Wickets timeline, Extras breakdown), and live ball-by-ball commentary stream with milestone emphasis.
3. Upcoming Tour Calendar & Fixtures: Chronological schedule grouped by date and tournament, with match venues and start times in Indian Standard Time (IST).
4. Player Analytics Laboratory: Player search across 1,100+ cricketers, verified athlete biography, official ICC Rankings (Test, ODI, T20I Batting & Bowling), multi-format career records (Test, ODI, T20I, IPL), batting/bowling discipline switch, and interactive 5-axis Radar visualizer.
5. Head-to-Head Comparison Battleground: Side-by-side player selection with simultaneous multi-axis radar chart comparison and automated stat delta highlighting.
6. Personal Watchlist & Pinned Radar: Pin live games to a top HUD bar and bookmark tracked players with offline and cloud sync.
7. Universal Spotlight Command Palette: Global shortcut (Ctrl+K) search modal for matches, players, and instant navigation.

---

### SELECTED DESIGN DIRECTION: "THE QUANT PIT" (SPORTS TELEMETRY TERMINAL)

1. Visual Identity & Aesthetics:
   - Root Canvas: Deep Obsidian Void `#07080C`.
   - Panels & Modular Bento Tiles: `#0D0F17` with subtle hairline border `#1F2637` and 6px border-radius.
   - Text Hierarchy: Crisp stark white `#F3F5FA` for scores and primary titles; metallic silver `#9EA8BD` for subtitles; muted slate `#5E677D` for metadata.
   - High-Voltage Signal Accents:
     * Phosphor Green `#00F59B` for live status, winning states, boundary 4s, and leading stats.
     * Laser Crimson `#FF2E54` for dismissals, wickets, and alerts.
     * Electric Amethyst `#9D4EDD` for maximum sixes and major milestones.
     * Cyan Blue `#00B4D8` for secondary comparisons and bowling radar vectors.
     * Warning Amber `#FFB300` for upcoming match previews and toss alerts.
   - Typography: Technical Grotesque (Geist Sans) with tight negative letter tracking (-0.03em) paired with Monospace Tabular Figures (JetBrains Mono) for all scores, run-rates, and numerical stats.

2. Navigation & Layout Model:
   - Left Persistent Icon Rail (64px wide) with active glowing phosphor indicators.
   - Top Mini Live Ticker Tape displaying horizontal live scores across ongoing international games.
   - Split-Screen Telemetry Dock: A persistent, collapsible 380px right-hand side dock that keeps a live match active while the user navigates other pages on the main canvas.
   - Bento-Grid organization for match cards and statistical modules.

---

### SCREENS TO DESIGN IN FIGMA

Create a comprehensive multi-screen canvas covering:
1. SCREEN 1: Live Scores Telemetry Workspace (`/live`)
   - Top Live Ticker Tape.
   - Filter Control Bar: Format pills (All, Live Now with red pulsing dot, Upcoming, Tests, ODIs, T20 Leagues, Results), Date Stepper, and Refresh Button.
   - Pinned Spotlight Hero (Australia vs India, 3rd Test at MCG, Day 4 live run chase).
   - Bento Grid of Live & Completed Match Cards with Over Bead Strips (e.g. `1 4 W 0 6 1`).
   - Collapsible Right Telemetry Dock showing live win probability (78% IND vs 22% AUS), active striker/non-striker pair, and active bowler.

2. SCREEN 2: Deep Match Center (Expanded Scorecard & Commentary)
   - Split scoreboard header with flags, venue, and toss info.
   - Innings tabs (`India 1st Innings`, `Australia 1st Innings`, `India 2nd Innings`).
   - High-density batting table with dismissal descriptions and strike rates.
   - Fall of Wickets horizontal progress bar.
   - Live Commentary stream with high-contrast event badges for Wickets and Boundaries.

3. SCREEN 3: Player Analytics Lab (`/players`)
   - Athlete Spotlight Header (Virat Kohli - India, Top-order Batter, Bio traits, Teams).
   - Official ICC Rankings 6-card display (#6 Test, #3 ODI, #14 T20I).
   - Format switcher (Test | ODI | T20I | IPL) + Discipline toggle (Batting | Bowling).
   - 5-Axis Spider Radar Chart alongside comprehensive career stat matrix table.
   - "Compare with another player" CTA.

4. SCREEN 4: Head-to-Head Comparison Battleground (`/compare`)
   - Dual player inputs (Virat Kohli vs Rohit Sharma).
   - Overlapping dual-polygon radar chart (Phosphor Green vs Cyan Blue).
   - Comparative stat table with green delta pill badges marking superior statistics.

5. SCREEN 5: Upcoming Fixtures & Tour Calendar (`/schedule`)
   - Grouped chronological date cards with local IST start times, countdown timers, venue tags, and bookmark actions.

6. SCREEN 6: Universal Spotlight Command Palette (Ctrl+K Overlay)
   - Keyboard-accessible search modal with categorized results (Matches, Players, Quick Actions).

7. MOBILE RESPONSIVE ADAPTATIONS
   - Bottom navigation bar with haptic icon styling.
   - Bottom sheet slide-up match center with persistent mini score HUD.
   - Horizontally swipeable stat cards.

---

### DESIGN REQUIREMENTS & POLISH
- Use realistic cricket data provided in the specification (no "Lorem Ipsum" or "Player 1").
- Design meaningful Empty States, Loading Skeletons, and Error alerts.
- Ensure all numbers use tabular font styling so numbers align vertically.
- Deliver pixel-perfect auto-layout components, clear design tokens (colors, typography, spacing, radius), and production-grade hierarchy.
```

---

## 15. Confirmed Product Facts

* **Repository Tech Stack**: React 18, Vite, Tailwind CSS v3.4, Node.js, Express, MongoDB (Mongoose), Cheerio web scraper with persistent connection pooling, Recharts for radar and bar analytics, Lucide React icons, and Axios.
* **Verified Backend Routes**:
  - `GET /api/live`: Returns live, upcoming, and completed matches with real-time score enrichment.
  - `GET /api/live/details?url={cricbuzzUrl}`: Returns granular match details, full scorecards, and ball-by-ball commentary.
  - `GET /api/schedule`: Returns international series and match schedules.
  - `GET /api/players/:query`: Returns verified player bio, ICC rankings, and multi-format batting/bowling career statistics.
  - `GET /api/players/compare?player1={p1}&player2={p2}`: Returns side-by-side career statistics for two players.
  - `GET /api/favorites`, `POST /api/favorites`, `DELETE /api/favorites/:id`: Manages user bookmarks with dual cloud/offline persistence.
  - `GET /api/health`: Uptime monitoring endpoint for 24/7 keep-alive.
* **Verified Real-World Data Capabilities**:
  - Multi-innings score parsing (Test matches up to 4 innings).
  - Accurate dismissal types (`c batter b bowler`, `lbw`, `run out`, `stumped`).
  - Strict IST (Asia/Kolkata) match timestamp formatting.
  - 1,100+ Master Player Registry for instant name lookup.

---

## 16. Design Recommendations

1. **Implement Split-Screen Multi-Tasking**: Replace the full-screen modal popup with an off-canvas **Telemetry Dock** so users can follow live ball-by-ball updates while comparing players or exploring the calendar.
2. **Prioritize Monospace Tabular Numerals**: Format all scores, run rates, balls, overs, and averages in monospace numerals (`font-mono tabular-nums`) to prevent horizontal jitter during live score transitions.
3. **Elevate the Over Bead Strip**: Give users an immediate visual snapshot of over momentum by styling dots as subtle pills, boundary 4s as glowing emerald pills, 6s as electric purple pills, and wickets as solid laser crimson badges.
4. **Context-Aware Comparison Prompts**: When a user views any player profile (e.g. Travis Head), automatically suggest logical comparison rivals (e.g. Rohit Sharma or David Warner) in a single-click prompt.
5. **Persistent Pinned Match HUD**: Provide a compact, 36px fixed bottom or top telemetry bar for the user's pinned match so they never miss a critical over while exploring other sections of the app.
