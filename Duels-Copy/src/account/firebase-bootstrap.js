
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
  import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    signOut
  } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
  import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    deleteField,
    runTransaction
  } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

  const firebaseConfig = Object.freeze({
    apiKey: "AIzaSyCOZN52MvnJkECzeiSPVr2etHxiX4G4c0A",
    authDomain: "duels-data.firebaseapp.com",
    projectId: "duels-data",
    storageBucket: "duels-data.firebasestorage.app",
    messagingSenderId: "832334406371",
    appId: "1:832334406371:web:17115b80accd9e73621bd6",
    measurementId: "G-YFEHB179PG"
  });

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  try{
    await setPersistence(
      auth,
      browserLocalPersistence
    );
  }catch(error){
    console.warn(
      '[Duels] Firebase local persistence 설정 실패, 기본 persistence로 계속합니다.',
      error
    );
  }

  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({prompt:'select_account'});

  window.DuelsFirebase = Object.freeze({
    config: firebaseConfig,
    app,
    auth,
    db,
    googleProvider,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    signOut,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    deleteField,
    runTransaction,
    async signInGoogle(){
      return signInWithPopup(auth, googleProvider);
    },
    async signOutCurrent(){
      return signOut(auth);
    },
    currentUser(){
      return auth.currentUser || null;
    },
    async upsertOwnProfile(data={}){
      const user=auth.currentUser;
      if(!user)throw new Error('Firebase 로그인이 필요합니다.');
      const ref=doc(db,'users',user.uid);
      const allowed={
        displayName:String(data.displayName||user.displayName||'플레이어').trim().slice(0,24)||'플레이어',
        mainCharacterId:typeof data.mainCharacterId==='string'?data.mainCharacterId:null,
        mainCharacterExplicit:data.mainCharacterExplicit===true,
        profile:(data.profile&&typeof data.profile==='object')?data.profile:{}
      };
      await updateDoc(ref,{
        ...allowed,
        updatedAt:serverTimestamp()
      });
      return ref;
    },
    async loadOwnProfile(){
      const user=auth.currentUser;
      if(!user)throw new Error('Firebase 로그인이 필요합니다.');
      const snapshot=await getDoc(doc(db,'users',user.uid));
      return snapshot.exists()?snapshot.data():null;
    },
    async upsertOwnProgress(){
      throw new Error('진행도는 클라이언트에서 직접 저장할 수 없습니다.');
    },
    async loadOwnProgress(){
      const user=auth.currentUser;
      if(!user)throw new Error('Firebase 로그인이 필요합니다.');
      const firebaseIdToken=await user.getIdToken();
      const response=await fetch('https://duels-account-api.lyan5097gc.workers.dev/firebase/progress/load',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({firebaseIdToken})
      });
      let payload=null;
      try{payload=await response.json();}catch{}
      if(!response.ok||!payload?.ok){
        throw new Error(payload?.message||payload?.error||`Firebase 진행도 불러오기 실패 (${response.status})`);
      }
      return payload.progress||null;
    },
    async loadOwnAccount(){
      const user=auth.currentUser;
      if(!user)throw new Error('Firebase 로그인이 필요합니다.');
      const firebaseIdToken=await user.getIdToken();
      const response=await fetch('https://duels-account-api.lyan5097gc.workers.dev/firebase/account/load',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({firebaseIdToken})
      });
      let payload=null;
      try{payload=await response.json();}catch{}
      if(!response.ok||!payload?.ok){
        throw new Error(payload?.message||payload?.error||`Firebase 계정 불러오기 실패 (${response.status})`);
      }
      return payload.account||null;
    },
    async createOwnAccount(data={}){
      const user=auth.currentUser;
      if(!user)throw new Error('Firebase 로그인이 필요합니다.');
      const firebaseIdToken=await user.getIdToken(true);
      const response=await fetch('https://duels-account-api.lyan5097gc.workers.dev/firebase/account/create',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          firebaseIdToken,
          displayName:String(data.displayName||'').trim().slice(0,24)
        })
      });
      let payload=null;
      try{payload=await response.json();}catch{}
      if(!response.ok||!payload?.ok){
        throw new Error(payload?.message||payload?.error||`Firebase 계정 생성 실패 (${response.status})`);
      }
      return payload.account||null;
    },
    async saveOwnAccount(data={}){
      await this.upsertOwnProfile(data);
      return true;
    },
    async deleteOwnAccountData(){
      const user=auth.currentUser;
      if(!user)throw new Error('Firebase 로그인이 필요합니다.');
      const firebaseIdToken=await user.getIdToken();
      const response=await fetch('https://duels-account-api.lyan5097gc.workers.dev/firebase/account/delete-data',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({firebaseIdToken})
      });
      let payload=null;
      try{payload=await response.json();}catch{}
      if(!response.ok||!payload?.ok){
        throw new Error(payload?.message||payload?.error||`Firebase 계정 데이터 삭제 실패 (${response.status})`);
      }
      return true;
    },
    async deleteOwnProfile(){
      return this.deleteOwnAccountData();
    }
  });

  window.dispatchEvent(new CustomEvent('duels-firebase-ready',{
    detail:{projectId:firebaseConfig.projectId}
  }));
  console.info('[Duels] Firebase ready:', firebaseConfig.projectId);
