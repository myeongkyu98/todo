// 화면 동작: Firebase Realtime Database(클라우드 DB)의 'todos' 아래에 할일을 저장해요.
// onValue로 DB를 지켜보고 있어서, 바뀌면 화면이 자동으로 다시 그려져요.
// firebase.js가 먼저 불러와져 있어야 해요. (window.firebaseReady)

// Firebase 준비가 끝나면 DB 위치(ref)를 돌려줘요
async function dbRef(path) {
  const { db, rtdb } = await window.firebaseReady;
  return rtdb.ref(db, path);
}
async function rtdbTools() {
  return (await window.firebaseReady).rtdb;
}

const list = document.getElementById('list');
const form = document.getElementById('add-form');
const input = document.getElementById('new-text');
const summary = document.getElementById('summary');
const empty = document.getElementById('empty');
const errorBox = document.getElementById('error');

let todos = [];
let filter = 'all';
let editingId = null; // 지금 수정 중인 할일

// ----- 에러 표시 -----
function friendlyError(e) {
  if (/permission/i.test(e.code || e.message || '')) {
    return 'Realtime Database 보안 규칙 때문에 막혔어요. README의 "Firebase 설정"을 확인해 주세요.';
  }
  return e.message || '오류가 났어요.';
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = !msg;
}

async function run(task) {
  try {
    showError('');
    await task();
  } catch (e) {
    showError(friendlyError(e));
  }
  render();
}

// 입력값 검사: 빈 글자나 200자 넘는 글자는 막아요
function cleanText(text) {
  const t = text.trim();
  if (!t || t.length > 200) throw new Error('할일 내용을 1~200자로 입력해 주세요.');
  return t;
}

// ----- 화면 그리기 -----
function render() {
  // 수정 중에 목록이 다시 그려져도, 입력하던 글자는 지켜 줘요
  const box = list.querySelector('.edit-input');
  const draft = box && box.dataset.id === editingId ? box.value : undefined;

  const left = todos.filter((t) => !t.done).length;
  summary.textContent = `전체 ${todos.length}개 · 남은 할일 ${left}개`;

  const shown = todos.filter((t) =>
    filter === 'todo' ? !t.done : filter === 'done' ? t.done : true
  );
  empty.hidden = shown.length > 0;
  list.innerHTML = '';

  for (const todo of shown) {
    const li = document.createElement('li');
    li.className = 'item' + (todo.done ? ' done' : '');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = todo.done;
    check.setAttribute('aria-label', '완료 표시');
    check.addEventListener('change', () => toggle(todo));

    const actions = document.createElement('div');
    actions.className = 'actions';

    if (editingId === todo.id) {
      // 수정 모드
      const edit = document.createElement('input');
      edit.className = 'edit-input';
      edit.dataset.id = todo.id;
      edit.value = draft ?? todo.text;
      edit.maxLength = 200;
      edit.addEventListener('keydown', (e) => {
        if (e.isComposing) return; // 한글 입력 중(조합 중) Enter는 무시
        if (e.key === 'Enter') saveEdit(todo, edit.value);
        if (e.key === 'Escape') { editingId = null; render(); }
      });
      actions.append(
        button('저장', 'save', () => saveEdit(todo, edit.value)),
        button('취소', '', () => { editingId = null; render(); })
      );
      li.append(check, edit, actions);
    } else {
      const text = document.createElement('span');
      text.className = 'text';
      text.textContent = todo.text; // textContent라서 HTML이 실행되지 않아 안전해요
      text.addEventListener('dblclick', () => { editingId = todo.id; render(); });
      actions.append(
        button('수정', 'edit', () => { editingId = todo.id; render(); }),
        button('삭제', 'delete', () => remove(todo))
      );
      li.append(check, text, actions);
    }
    list.append(li);
  }
  // 수정 칸이 있으면 바로 입력할 수 있게 커서를 넣어요
  const editBox = list.querySelector('.edit-input');
  if (editBox && document.activeElement !== editBox) editBox.focus();
}

function button(label, cls, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  if (cls) b.className = cls;
  b.addEventListener('click', onClick);
  return b;
}

// ----- 동작 -----

// 10초가 지나도 못 불러오면 안내를 보여줘요 (연결이 안 되면 Firebase가 에러 없이 계속 기다리거든요)
const slowTimer = setTimeout(() => {
  showError('Realtime Database에 연결하지 못하고 있어요. 인터넷 연결과 public/firebase.js의 databaseURL을 확인해 주세요.');
}, 10000);

// DB 지켜보기: 처음 한 번 + 바뀔 때마다 todos를 새로 받아요
async function watchTodos() {
  const { onValue } = await rtdbTools();
  onValue(
    await dbRef('todos'),
    (snapshot) => {
      clearTimeout(slowTimer);
      // DB에는 { id1: {...}, id2: {...} } 모양으로 있어서, 배열로 바꾸고 오래된 순으로 정렬해요
      const data = snapshot.val() || {};
      todos = Object.entries(data)
        .map(([id, t]) => ({ id, ...t }))
        .sort((a, b) => a.createdAt - b.createdAt);
      if (editingId && !todos.some((t) => t.id === editingId)) editingId = null;
      showError('');
      render();
    },
    (e) => {
      clearTimeout(slowTimer);
      summary.textContent = '불러오지 못했어요';
      showError(friendlyError(e));
    }
  );
}
watchTodos().catch((e) => {
  // Firebase 도구를 인터넷에서 못 받아온 경우 (인터넷 끊김 등)
  clearTimeout(slowTimer);
  summary.textContent = '불러오지 못했어요';
  showError('Firebase를 불러오지 못했어요. 인터넷 연결을 확인해 주세요. (' + e.message + ')');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = input.value;
  if (!raw.trim()) return;
  input.value = ''; // 바로 비워서 다음 할일을 이어서 입력할 수 있게
  run(async () => {
    try {
      const text = cleanText(raw);
      const { push } = await rtdbTools();
      await push(await dbRef('todos'), { text, done: false, createdAt: Date.now() });
    } catch (err) {
      input.value = raw; // 실패하면 입력한 글자를 되돌려 줘요
      throw err;
    }
  });
});

function toggle(todo) {
  run(async () => {
    const { update } = await rtdbTools();
    await update(await dbRef(`todos/${todo.id}`), { done: !todo.done });
  });
}

function saveEdit(todo, value) {
  run(async () => {
    const text = cleanText(value);
    const { update } = await rtdbTools();
    await update(await dbRef(`todos/${todo.id}`), { text });
    editingId = null;
  });
}

function remove(todo) {
  if (!confirm(`"${todo.text}" 할일을 삭제할까요?`)) return;
  run(async () => {
    const { remove: removeData } = await rtdbTools();
    await removeData(await dbRef(`todos/${todo.id}`));
  });
}

document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
  });
});
