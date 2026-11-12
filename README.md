# 할일(To-do) 앱

할일을 **추가 · 수정 · 완료 체크 · 삭제**할 수 있는 앱이에요.
할일은 **Firebase Realtime Database**(구글의 클라우드 데이터베이스)에 저장돼요.
그래서 새로고침해도, 다른 기기에서 열어도 같은 할일이 보여요. 한 곳에서 바꾸면 다른 화면에도 바로 반영돼요.

## Firebase 설정 (처음 한 번만)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 `fisrt-backend-todo` 프로젝트를 열어요.
2. 왼쪽 메뉴 **빌드 > Realtime Database**를 열어요. (데이터베이스가 없으면 **데이터베이스 만들기** → 테스트 모드)
3. **규칙** 탭을 열고, 이 폴더의 `database.rules.json` 내용을 붙여넣은 뒤 **게시**를 눌러요.
   (테스트 모드는 30일 뒤에 자동으로 잠기는데, 이 규칙을 넣으면 계속 쓸 수 있어요.
   또 `todos` 말고 다른 곳은 쓰지 못하게 막고, 글자 수 같은 내용도 검사해 줘요.)

데이터베이스 주소(`databaseURL`)는 `public/firebase.js`에 들어 있어요.

> ⚠️ 로그인 기능이 없어서, 이 앱 주소를 아는 사람은 누구나 할일을 보고 바꿀 수 있어요. 연습용으로만 써 주세요.

## 실행 방법

1. [Node.js](https://nodejs.org)를 설치해요.
2. 이 폴더(`fisrt-backend`)에서 터미널을 열고 아래 명령을 실행해요.

```bash
npm install
```

```bash
npm start
```

3. 브라우저에서 http://localhost:3000 을 열어요.

끄려면 터미널에서 `Ctrl + C`를 누르세요.

> 💡 서버 없이 `public/index.html`을 더블클릭해서 열어도 동작해요. (인터넷 연결은 필요해요)

## 폴더 구조

```
server.js           화면 파일을 보여주는 서버
public/index.html   화면
public/style.css    디자인 (모바일 반응형)
public/app.js       할일 추가/수정/삭제 동작 (Realtime Database 사용)
public/firebase.js  Firebase 연결 설정
database.rules.json Realtime Database 보안 규칙
```

할일은 Realtime Database의 `todos` 아래에 `{ text, done, createdAt }` 모양으로 저장돼요.
