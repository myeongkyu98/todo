// Firebase 연결 설정
// - 이 값들(apiKey 포함)은 웹 화면에 넣어도 되는 공개용 정보예요.
// - 일반 <script>로 불러와요. (type="module"은 index.html을 더블클릭해서
//   file:// 로 열면 브라우저가 막아서 아무것도 동작하지 않거든요)
// - Firebase 도구는 import()로 인터넷(gstatic)에서 받아와요.
// - 다른 파일에서 쓰려면: const { db, rtdb } = await window.firebaseReady;

const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/13.3.0';

const firebaseConfig = {
  apiKey: 'AIzaSyBoQVKG3clcLrxMmmovXzLrqsLW9fpeFl8',
  authDomain: 'fisrt-backend-todo.firebaseapp.com',
  databaseURL: 'https://fisrt-backend-todo-default-rtdb.firebaseio.com',
  projectId: 'fisrt-backend-todo',
  storageBucket: 'fisrt-backend-todo.firebasestorage.app',
  messagingSenderId: '124792139336',
  appId: '1:124792139336:web:f9aaf61318c24f631d727d',
  measurementId: 'G-XWYVHR8241',
};

window.firebaseReady = (async () => {
  const { initializeApp } = await import(`${FIREBASE_SDK}/firebase-app.js`);
  const rtdb = await import(`${FIREBASE_SDK}/firebase-database.js`);

  // Firebase 시작
  const app = initializeApp(firebaseConfig);

  // 할일을 저장하는 클라우드 DB(Realtime Database)
  const db = rtdb.getDatabase(app);

  // 방문 통계(Analytics): 웹 주소(http/https)로 열었을 때만, 지원하는 브라우저에서만 켜요
  if (location.protocol.startsWith('http')) {
    import(`${FIREBASE_SDK}/firebase-analytics.js`)
      .then(async ({ getAnalytics, isSupported }) => {
        if (await isSupported()) getAnalytics(app);
      })
      .catch(() => {});
  }

  console.log('Firebase 연결됨:', app.options.projectId);
  return { app, db, rtdb };
})();
