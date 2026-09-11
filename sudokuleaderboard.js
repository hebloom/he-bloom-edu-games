import { initializeApp, getApps, getApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB0crUiSYBTxye5nHDOYJ8I7dNAv-mLO7g",
  authDomain: "he-bloom-edu-games.firebaseapp.com",
  projectId: "he-bloom-edu-games",
  storageBucket: "he-bloom-edu-games.firebasestorage.app",
  messagingSenderId: "629319143905",
  appId: "1:629319143905:web:2a989f47e473c4ad7302a0"
};


const app = getApps().length ?
  getApp() :
  initializeApp(firebaseConfig);


const db = getFirestore(app);


/* =========================
   SAVE SUDOKU RESULT
   ========================= */

export async function saveSudokuResult(
  name,
  game,
  level,
  timeSeconds,
  uid
) {
  
  if (!name || !uid) {
    return;
  }
  
  
  if (
    !["numbers", "colours"].includes(game)
  ) {
    return;
  }
  
  
  if (
    !["easy", "medium", "hard"].includes(level)
  ) {
    return;
  }
  
  
  const seconds = Number(timeSeconds);
  
  
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return;
  }
  
  
  const key = `${game}_${level}`;
  
  
  const leaderboardRef = doc(
    db,
    "sudokuLeaderboard",
    key
  );
  
  
  const leaderboardSnap =
    await getDoc(leaderboardRef);
  
  
  let players = [];
  
  
  if (leaderboardSnap.exists()) {
    
    players =
      leaderboardSnap.data().players || [];
    
  }
  
  
  const existing =
    players.find(
      player =>
      player.uid === uid
    );
  
  
  /* PEMAIN BARU */
  
  if (!existing) {
    
    players.push({
      
      uid: uid,
      name: name,
      time: seconds
      
    });
    
  }
  
  
  /* PEMAIN SAMA */
  
  else {
    
    existing.name = name;
    
    
    if (
      seconds <
      Number(existing.time)
    ) {
      
      existing.time = seconds;
      
    }
    
  }
  
  
  /* MASA TERPANTAS DAHULU */
  
  players.sort(
    (a, b) =>
    Number(a.time) -
    Number(b.time)
  );
  
  
  await setDoc(
    leaderboardRef,
    {
      players: players
    }
  );
  
  
  console.log(
    "Sudoku leaderboard disimpan:",
    name,
    game,
    level,
    seconds
  );
  
}