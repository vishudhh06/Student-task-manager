// ---- DATA ----
let tasks = JSON.parse(localStorage.getItem('deepak-tasks') || '[]');
let currentFilter = 'all';
let currentView = 'dashboard';
let editId = null;
let currentUser = JSON.parse(localStorage.getItem('deepak-user') || 'null');

// Seed sample tasks if empty
if (tasks.length === 0) {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const add = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return fmt(d); };
  tasks = [
    { id: 1, title: 'Complete BCSP-064 Project Report', desc: 'Write and submit final project report', subject: 'BCSP-064', deadline: add(2), priority: 'high', status: 'pending' },
    { id: 2, title: 'Study for MCS-021 Exam', desc: 'Cover all units of Data Communication', subject: 'MCS-021', deadline: add(5), priority: 'medium', status: 'pending' },
    { id: 3, title: 'Submit BCA Assignment', desc: 'Complete online assignment submission', subject: 'BCS-012', deadline: add(-1), priority: 'high', status: 'pending' },
    { id: 4, title: 'Practice SQL Queries', desc: 'Practice joins, subqueries, normalization', subject: 'MCS-023', deadline: add(7), priority: 'low', status: 'completed' },
    { id: 5, title: 'Revise C Programming', desc: 'Revise pointers and memory management', subject: 'BCS-011', deadline: add(10), priority: 'medium', status: 'pending' },
  ];
  save();
}

function save() {
  localStorage.setItem('deepak-tasks', JSON.stringify(tasks));
}

function saveUser() {
  localStorage.setItem('deepak-user', JSON.stringify(currentUser));
}

// ---- AVATAR HANDLING ----
function previewAvatar(input, previewId) {
  const file = input.files[0];
  const preview = document.getElementById(previewId);
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.style.backgroundImage = `url(${e.target.result})`;
      preview.innerHTML = ''; // Remove any text content
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.backgroundImage = '';
    preview.innerHTML = '?';
  }
}

// ---- USER MANAGEMENT ----
function updateUserDisplay() {
  const userEl = document.getElementById('sidebar-user');
  const actionsEl = document.getElementById('user-actions');
  const avatarEl = document.getElementById('user-avatar');
  
  if (currentUser) {
    if (currentUser.avatar) {
      avatarEl.style.backgroundImage = `url(${currentUser.avatar})`;
      avatarEl.textContent = '';
    } else {
      avatarEl.style.backgroundImage = '';
      avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
    }
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = `${currentUser.course || 'Student'} · ${currentUser.id || 'No ID'}`;
    actionsEl.style.display = 'flex';
    userEl.onclick = null;
    userEl.style.cursor = 'default';
  } else {
    avatarEl.style.backgroundImage = '';
    avatarEl.textContent = '?';
    document.getElementById('user-name').textContent = 'Not logged in';
    document.getElementById('user-role').textContent = 'Click to login';
    actionsEl.style.display = 'none';
    userEl.onclick = openLoginModal;
    userEl.style.cursor = 'pointer';
  }
}

function login() {
  const name = document.getElementById('login-name').value.trim();
  const id = document.getElementById('login-id').value.trim();
  const course = document.getElementById('login-course').value.trim();
  const avatarInput = document.getElementById('login-avatar');
  let avatar = null;
  
  if (!name) {
    showToast('⚠', 'Please enter your name');
    return;
  }
  
  // Handle avatar upload
  if (avatarInput.files && avatarInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      avatar = e.target.result;
      currentUser = { name, id: id || null, course: course || null, avatar };
      saveUser();
      updateUserDisplay();
      closeLoginModal();
      showToast('✓', `Welcome, ${name}!`);
    };
    reader.readAsDataURL(avatarInput.files[0]);
  } else {
    currentUser = { name, id: id || null, course: course || null, avatar };
    saveUser();
    updateUserDisplay();
    closeLoginModal();
    showToast('✓', `Welcome, ${name}!`);
  }
}

function logout() {
  if (confirm('Are you sure you want to logout? Your tasks will be saved.')) {
    currentUser = null;
    saveUser();
    updateUserDisplay();
    showToast('↪', 'Logged out successfully');
  }
}

function openProfileModal() {
  if (!currentUser) return;
  document.getElementById('profile-name').value = currentUser.name || '';
  document.getElementById('profile-id').value = currentUser.id || '';
  document.getElementById('profile-course').value = currentUser.course || '';
  
  // Reset avatar input and show current avatar
  document.getElementById('profile-avatar').value = '';
  const preview = document.getElementById('profile-avatar-preview');
  if (currentUser.avatar) {
    preview.style.backgroundImage = `url(${currentUser.avatar})`;
    preview.innerHTML = '';
  } else {
    preview.style.backgroundImage = '';
    preview.innerHTML = currentUser.name.charAt(0).toUpperCase();
  }
  
  document.getElementById('profile-modal').classList.add('open');
  setTimeout(() => document.getElementById('profile-name').focus(), 100);
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.remove('open');
}

function closeProfileModalOutside(e) {
  if (e.target === document.getElementById('profile-modal')) closeProfileModal();
}

function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const id = document.getElementById('profile-id').value.trim();
  const course = document.getElementById('profile-course').value.trim();
  const avatarInput = document.getElementById('profile-avatar');
  
  if (!name) {
    showToast('⚠', 'Please enter your name');
    return;
  }
  
  // Handle avatar upload
  if (avatarInput.files && avatarInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const avatar = e.target.result;
      currentUser = { ...currentUser, name, id: id || null, course: course || null, avatar };
      saveUser();
      updateUserDisplay();
      closeProfileModal();
      showToast('✓', 'Profile updated successfully!');
    };
    reader.readAsDataURL(avatarInput.files[0]);
  } else {
    // Keep existing avatar if no new file selected
    currentUser = { ...currentUser, name, id: id || null, course: course || null };
    saveUser();
    updateUserDisplay();
    closeProfileModal();
    showToast('✓', 'Profile updated successfully!');
  }
}

function openLoginModal() {
  // Reset all form fields
  document.getElementById('login-name').value = '';
  document.getElementById('login-id').value = '';
  document.getElementById('login-course').value = '';
  document.getElementById('login-avatar').value = '';
  document.getElementById('login-avatar-preview').style.backgroundImage = '';
  document.getElementById('login-avatar-preview').innerHTML = '?';
  
  document.getElementById('login-modal').classList.add('open');
  setTimeout(() => document.getElementById('login-name').focus(), 100);
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('open');
}

function closeLoginModalOutside(e) {
  if (e.target === document.getElementById('login-modal')) closeLoginModal();
}

// ---- STATS ----
function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const today = new Date(); today.setHours(0,0,0,0);
  const overdue = tasks.filter(t => t.status === 'pending' && new Date(t.deadline) < today).length;
  const dueToday = tasks.filter(t => { const d = new Date(t.deadline); d.setHours(0,0,0,0); return t.status==='pending' && d.getTime()===today.getTime(); }).length;
  const high = tasks.filter(t => t.priority === 'high' && t.status === 'pending').length;
  const medium = tasks.filter(t => t.priority === 'medium' && t.status === 'pending').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-overdue').textContent = overdue;

  document.getElementById('badge-all').textContent = total;
  document.getElementById('badge-pending').textContent = pending;
  document.getElementById('badge-done').textContent = done;
  document.getElementById('badge-overdue').textContent = overdue;
  document.getElementById('badge-today').textContent = dueToday;
  document.getElementById('badge-high').textContent = high;
  document.getElementById('badge-medium').textContent = medium;

  const pct = total ? Math.round((done/total)*100) : 0;
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';

  // Reminder banner
  const banner = document.getElementById('reminder-banner');
  if (overdue > 0 || dueToday > 0) {
    banner.style.display = 'flex';
    if (overdue > 0) {
      document.getElementById('reminder-title').textContent = `⚠ ${overdue} Overdue Task${overdue>1?'s':''}`;
      document.getElementById('reminder-desc').textContent = `You have ${overdue} task${overdue>1?'s':''} past deadline. Take action now!`;
    } else {
      document.getElementById('reminder-title').textContent = `📅 ${dueToday} Task${dueToday>1?'s':''} Due Today`;
      document.getElementById('reminder-desc').textContent = `Don't forget to complete your tasks due today.`;
    }
  } else {
    banner.style.display = 'none';
  }
}

// ---- FILTERS ----
function getDeadlineClass(deadline, status) {
  if (status === 'completed') return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(deadline); d.setHours(0,0,0,0);
  const diff = (d - today) / (1000*60*60*24);
  if (diff < 0) return 'overdue';
  if (diff <= 2) return 'soon';
  return '';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function getFilteredTasks() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const today = new Date(); today.setHours(0,0,0,0);

  let filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search) || (t.subject||'').toLowerCase().includes(search);
    if (!matchSearch) return false;

    if (currentView === 'dashboard' || currentView === 'all') {
      if (currentFilter === 'pending') return t.status === 'pending';
      if (currentFilter === 'completed') return t.status === 'completed';
      return true;
    }
    if (currentView === 'pending') return t.status === 'pending';
    if (currentView === 'completed') return t.status === 'completed';
    if (currentView === 'high') return t.priority === 'high' && t.status === 'pending';
    if (currentView === 'medium') return t.priority === 'medium' && t.status === 'pending';
    if (currentView === 'low') return t.priority === 'low' && t.status === 'pending';
    if (currentView === 'overdue') { const d = new Date(t.deadline); d.setHours(0,0,0,0); return t.status==='pending' && d < today; }
    if (currentView === 'today') { const d = new Date(t.deadline); d.setHours(0,0,0,0); return t.status==='pending' && d.getTime()===today.getTime(); }
    return true;
  });

  // Sort: pending first, then by deadline
  filtered.sort((a,b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  return filtered;
}

// ---- RENDER ----
function renderTasks() {
  const list = document.getElementById('tasks-list');
  const empty = document.getElementById('empty-state');
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.classList.add('show');
    return;
  }
  empty.classList.remove('show');

  list.innerHTML = filtered.map(t => {
    const dlClass = getDeadlineClass(t.deadline, t.status);
    return `
    <div class="task-item ${t.status === 'completed' ? 'completed' : ''}" id="task-${t.id}">
      <div class="task-check" onclick="toggleTask(${t.id})">${t.status==='completed'?'✓':''}</div>
      <div class="task-body">
        <div class="task-title">${t.title}</div>
        <div class="task-meta">
          <span class="task-tag ${t.priority}">${t.priority.toUpperCase()}</span>
          ${t.subject ? `<span class="task-subject">${t.subject}</span>` : ''}
          <span class="task-deadline ${dlClass}">📅 ${formatDate(t.deadline)}${dlClass==='overdue'?' · OVERDUE':dlClass==='soon'?' · DUE SOON':''}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn edit" onclick="editTask(${t.id})" title="Edit">✏</button>
        <button class="task-btn delete" onclick="deleteTask(${t.id})" title="Delete">🗑</button>
      </div>
    </div>`;
  }).join('');

  updateStats();
}

// ---- ACTIONS ----
function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.status = t.status === 'completed' ? 'pending' : 'completed';
  save();
  renderTasks();
  showToast(t.status === 'completed' ? '✓' : '◷', t.status === 'completed' ? 'Task marked as complete!' : 'Task moved back to pending');
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderTasks();
  showToast('🗑', 'Task deleted');
}

function editTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  editId = id;
  document.getElementById('f-title').value = t.title;
  document.getElementById('f-desc').value = t.desc || '';
  document.getElementById('f-subject').value = t.subject || '';
  document.getElementById('f-deadline').value = t.deadline;
  document.getElementById('f-priority').value = t.priority;
  document.getElementById('modal-title').textContent = 'Edit Task';
  document.getElementById('modal-submit').textContent = 'Save Changes';
  openModal();
}

// ---- MODAL ----
function openModal() {
  // Close login modal if it's open
  closeLoginModal();
  closeProfileModal();
  
  document.getElementById('modal').classList.add('open');
  if (!editId) {
    document.getElementById('f-title').value = '';
    document.getElementById('f-desc').value = '';
    document.getElementById('f-subject').value = '';
    document.getElementById('f-priority').value = 'medium';
    // Default deadline = tomorrow
    const d = new Date(); d.setDate(d.getDate()+1);
    document.getElementById('f-deadline').value = d.toISOString().split('T')[0];
    document.getElementById('modal-title').textContent = 'Add New Task';
    document.getElementById('modal-submit').textContent = 'Add Task';
  }
  setTimeout(() => document.getElementById('f-title').focus(), 100);
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  editId = null;
}
function closeModalOutside(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

function submitTask() {
  const title = document.getElementById('f-title').value.trim();
  const deadline = document.getElementById('f-deadline').value;
  if (!title) { showToast('⚠', 'Please enter a task title'); return; }
  if (!deadline) { showToast('⚠', 'Please select a deadline'); return; }

  if (editId) {
    const t = tasks.find(t => t.id === editId);
    t.title = title;
    t.desc = document.getElementById('f-desc').value.trim();
    t.subject = document.getElementById('f-subject').value.trim();
    t.deadline = deadline;
    t.priority = document.getElementById('f-priority').value;
    showToast('✓', 'Task updated successfully!');
  } else {
    tasks.push({
      id: Date.now(),
      title,
      desc: document.getElementById('f-desc').value.trim(),
      subject: document.getElementById('f-subject').value.trim(),
      deadline,
      priority: document.getElementById('f-priority').value,
      status: 'pending'
    });
    showToast('✓', 'Task added successfully!');
  }
  save();
  closeModal();
  renderTasks();
}

// ---- VIEW / FILTER ----
function setView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const titles = {
    dashboard: ['Dashboard', 'Overview of your tasks'],
    all: ['All Tasks', 'Every task in one place'],
    pending: ['Pending Tasks', 'Tasks still in progress'],
    completed: ['Completed Tasks', 'Tasks you have finished'],
    high: ['High Priority', 'Urgent tasks needing attention'],
    medium: ['Medium Priority', 'Important but not urgent'],
    low: ['Low Priority', 'Tasks when you have time'],
    overdue: ['Overdue Tasks', 'Past deadline — act now!'],
    today: ["Due Today", "Tasks to complete today"],
  };
  const [title, sub] = titles[view] || ['Tasks', ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-sub').textContent = sub;

  const isDash = view === 'dashboard';
  document.getElementById('stats-row').style.display = isDash ? 'grid' : 'none';
  document.getElementById('progress-section').style.display = isDash ? 'block' : 'none';

  renderTasks();
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderTasks();
}

// ---- TOAST ----
let toastTimer;
function showToast(icon, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ---- SIDEBAR TOGGLE ----
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('open');
}

// ---- KEYBOARD ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeLoginModal();
    closeProfileModal();
  }
  if (e.key === 'n' && !e.ctrlKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') openModal();
});

// ---- INIT ----
updateUserDisplay();
// Don't force login - allow using the app without authentication
// if (!currentUser) {
//   openLoginModal();
// }
renderTasks();