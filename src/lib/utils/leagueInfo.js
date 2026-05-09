/*   STEP 1   */
export const leagueID = "1317629034393276416"; // your league ID
export const leagueName = "MFFGA - Dynasty"; // your league name
export const dues = 25; // (optional) used in template constitution page
export const dynasty = true; // true for dynasty leagues, false for redraft and keeper
export const enableBlog = false; // requires VITE_CONTENTFUL_ACCESS_TOKEN and VITE_CONTENTFUL_SPACE environment variables

/*   STEP 2   */
export const homepageText = `
  <p>Welcome to <strong>MFFGA &mdash; Dynasty</strong>, a 10-team dynasty fantasy football league split across two divisions: the <em>Nerd Football Conference (NFC)</em> and <em>Florida Men Incorporated (FMI)</em>.</p>
  <p>This is a PPR dynasty format with deep rosters (28 spots), 11 starters (1 QB, 2 RB, 2 WR, 1 TE, 5 FLEX), 4 IR slots, and a 4-round rookie draft. Six teams make the playoffs, with the postseason kicking off in Week 15.</p>
  <p>Trades are open year-round (deadline Week 11), waivers run on a $100 FAAB budget, and rookie picks can be traded. Settle in &mdash; this league is built for the long haul.</p>
`;

/*   STEP 3   */
/*
3 managers as an example. Uncomment (remove the //) before each line to make it live code
If you're having trouble, reference the Training Wheels' Manager Section
https://github.com/jake-kelley/ff-league-page/blob/master/TRAINING_WHEELS.md#ii-adding-managers-and-changing-the-homepage-text
*/

// To omit an optional field, set it's value to null

export const managers = [
    {
      "roster": 1,
      "managerID": "719734510853357568",
      "name": "kdrew3",
      "bio": "Commissioner. Manages SLAB 49IRs in the Nerd Football Conference (NFC).",
      "photo": "https://sleepercdn.com/uploads/0d3803a5532f6efa7e856c6209d0789b.jpg",
      "favoriteTeam": "min",
      "mode": "Win Now",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 2,
      "managerID": "1066560974100062208",
      "name": "footballguy07",
      "bio": "Manages a team in Florida Men Incorporated (FMI).",
      "photo": "https://sleepercdn.com/avatars/f0edbf4278f53f9425db175073df6584",
      "favoriteTeam": "hou",
      "mode": "Rebuild",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 3,
      "managerID": "760976276415733760",
      "name": "Burninator37",
      "bio": "Commissioner. Manages Naberhood Watch in Florida Men Incorporated (FMI).",
      "photo": "https://sleepercdn.com/uploads/5cb0d03209ceb3f74840f104651deee3.jpg",
      "favoriteTeam": "mia",
      "mode": "Win Now",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 4,
      "managerID": "858878070080262144",
      "name": "enori39",
      "bio": "Manages enori in the Nerd Football Conference (NFC).",
      "photo": "https://sleepercdn.com/avatars/82aec8e811b839b8ec25d7b458afd57b",
      "favoriteTeam": "min",
      "mode": "Win Now",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 5,
      "managerID": "833872283989831680",
      "name": "iand98",
      "bio": "Manages a team in the Nerd Football Conference (NFC).",
      "photo": "https://sleepercdn.com/avatars/f0edbf4278f53f9425db175073df6584",
      "favoriteTeam": "ne",
      "mode": "Win Now",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 6,
      "managerID": "861468630037155840",
      "name": "an1k",
      "bio": "Manages 2Fast 2Felonious pt Deux in the Nerd Football Conference (NFC).",
      "photo": "https://sleepercdn.com/avatars/e7af4deab0289b4f5505646424895246",
      "favoriteTeam": "kc",
      "mode": "Rebuild",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 7,
      "managerID": "976106540744699904",
      "name": "fvdiscipline",
      "bio": "Manages Burrowed time in the Nerd Football Conference (NFC).",
      "photo": "https://sleepercdn.com/avatars/b5b5681f00fd2d43c36488a8d561610a",
      "favoriteTeam": "ne",
      "mode": "Win Now",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 8,
      "managerID": "547879278974758912",
      "name": "NSDQ",
      "bio": "Manages Number 90 in Florida Men Incorporated (FMI).",
      "photo": "https://sleepercdn.com/avatars/dcf7134f5943f1f2d7cb02500ef12a85",
      "favoriteTeam": "chi",
      "mode": "Win Now",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 9,
      "managerID": "833791769777938432",
      "name": "KakeJelley",
      "bio": "Commissioner. Manages GoBills in Florida Men Incorporated (FMI).",
      "photo": "https://sleepercdn.com/avatars/5b1e688214667d9705bf9a59415414d5",
      "favoriteTeam": "buf",
      "mode": "Win Now",
      "preferredContact": "Sleeper",
    },
    {
      "roster": 10,
      "managerID": "975882743143825408",
      "name": "Mullma",
      "bio": "Manages Golden Charbonnet in Florida Men Incorporated (FMI).",
      "photo": "https://sleepercdn.com/uploads/e411a575c26e159e2ceceb093dd40d7a.jpg",
      "favoriteTeam": "mia",
      "mode": "Rebuild",
      "preferredContact": "Sleeper",
    },
  ]
  
  
  /*   !!  !!  IMPORTANT  !!  !! */
  /*
  Below is the most up to-date version of a manager. Please leave this commented out
  and don't delete it. This will be updated if any fields are added, removed or changed
  and will allow updates without causing merge conflicts
  */
  
    // {
    //   "roster": 3,  // (DEPRECATED! Don't use this anymore) ID of the roster that the manager manages (look at the order of the power rankings graph)
    //   "managerID": "12345678",  // the user's manager ID, go to https://api.sleeper.app/v1/league/<your_league_id>/users to find user IDs (you can use older leagueIDs to find user IDs for managers that are no longer in the league)
    //   "name": "Your Name",
    //   "tookOver": 2020, // (DEPRECATED! You don't need to use this anymore) (optional) used if a manager took over a team, delete this line or change to null otherwise
    //   "location": "Brooklyn", // (optional)
    //   "bio": "Lorem ipsum...",
    //   "photo": "/managers/name.jpg", // square ratio recommended (no larger than 500x500)
    //   "fantasyStart": 2014, // (optional) when did the manager start playing fantasy football
    //   "favoriteTeam": "nyj", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
    //   "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
    //   "rival": {
    //     name: "Rival", // Can be anything (usually your rival's name)
    //     link: 6, // manager array number within this array, or null to link back to all managers page
    //     image: "/managers/rival.jpg", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
    //   },
    //   "favoritePlayer": 1426, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
    //   "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
    //   "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
    //   "philosophy": "Your fantasy team's philosophy", // (optional)
    //   "tradingScale": 10, // 1 - 10 (optional)
    //   "preferredContact": "Text",  // (optional) 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    // },
    