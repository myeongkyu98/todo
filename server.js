// 할일 앱 서버
// - public 폴더의 화면(HTML/CSS/JS)을 보여주는 일만 해요.
// - 할일 데이터는 화면(public/app.js)이 Firebase Realtime Database에 직접 저장해요.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`할일 앱 실행 중: http://localhost:${PORT}`);
});
