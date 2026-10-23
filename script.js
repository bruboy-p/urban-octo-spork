// --- 1. MATRIX RAIN ANIMATION ---
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアカサタナハマヤラワガザダバパイキシチニヒミリヰギジヂビピウクスツヌフムユルグズブヅプエケセテネヘメレヱゲゼデベペオコソトノホモヨロヲゴゾドボポ';
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00FF66';
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = chars.charAt(Math.floor(Math.random() * chars.length));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

const matrixInterval = setInterval(drawMatrix, 33);

// --- 2. UPDATED CREDENTIALS & ACCOUNTS DATABASE ---
let defaultUsers = [
  { username: "mahassan4", password: "mahassan1210", role: "max" },
  { username: "admin", password: "traysonlayson", role: "editor" },
  { username: "person", password: "1234", role: "viewer" }
];

let usersDB = JSON.parse(localStorage.getItem("portalUsers")) || defaultUsers;
let activeUser = null;

function saveUsers() {
  localStorage.setItem("portalUsers", JSON.stringify(usersDB));
}

// --- 3. DIRECTORY DATA ---
let defaultDirectory = {
  "Primary Hub": [
    { name: "Server Alpha", url: "https://example.com" }
  ],
  "Secondary Hub": [
    { name: "Server Beta", url: "https://example.org" }
  ]
};

let directoryData = JSON.parse(localStorage.getItem("unblockerDirectory")) || defaultDirectory;
let selectedCategory = "Primary Hub";

function saveDirectory() {
  localStorage.setItem("unblockerDirectory", JSON.stringify(directoryData));
}

// --- 4. AUTHENTICATION LOGIC ---
function attemptLogin() {
  const userIn = document.getElementById("usernameInput").value.trim();
  const passIn = document.getElementById("passwordInput").value.trim();
  const errorMsg = document.getElementById("loginError");

  const foundUser = usersDB.find(u => u.username.toLowerCase() === userIn.toLowerCase() && u.password === passIn);

  if (foundUser) {
    activeUser = foundUser;
    errorMsg.style.display = "none";
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("mainDashboard").style.display = "block";
    
    setupDashboardUI();
  } else {
    errorMsg.style.display = "block";
  }
}

function logout() {
  activeUser = null;
  document.getElementById("usernameInput").value = "";
  document.getElementById("passwordInput").value = "";
  document.getElementById("mainDashboard").style.display = "none";
  document.getElementById("loginOverlay").style.display = "flex";
}

// --- 5. DASHBOARD & PERMISSIONS UI ---
function setupDashboardUI() {
  document.getElementById("displayUsername").innerText = activeUser.username;
  document.getElementById("displayRole").innerText = activeUser.role;

  // Max Control Panel Button: Only visible if activeUser role is MAX (mahassan4)
  if (activeUser.role === "max") {
    document.getElementById("maxPanelBtn").style.display = "inline-block";
  } else {
    document.getElementById("maxPanelBtn").style.display = "none";
  }

  // Editor Controls: Visible if activeUser is Editor (admin) OR Max (mahassan4)
  if (activeUser.role === "editor" || activeUser.role === "max") {
    document.getElementById("editorControls").style.display = "block";
  } else {
    document.getElementById("editorControls").style.display = "none";
  }

  renderCategories();
  renderLinks();
}

// --- 6. DIRECTORY CATEGORIES & LINKS ---
function renderCategories() {
  const container = document.getElementById("unblockerCategories");
  container.innerHTML = "";

  Object.keys(directoryData).forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `cat-btn ${cat === selectedCategory ? 'active' : ''}`;
    btn.innerText = cat;
    btn.onclick = () => {
      selectedCategory = cat;
      renderCategories();
      renderLinks();
    };
    container.appendChild(btn);
  });
}

function renderLinks() {
  const container = document.getElementById("linksList");
  document.getElementById("selectedUnblockerTitle").innerText = `${selectedCategory} - Active Working Links`;
  container.innerHTML = "";

  const links = directoryData[selectedCategory] || [];

  if (links.length === 0) {
    container.innerHTML = "<p>No working links stored for this service yet.</p>";
    return;
  }

  links.forEach((link, idx) => {
    const row = document.createElement("div");
    row.className = "link-row";

    let deleteBtn = "";
    if (activeUser.role === "editor" || activeUser.role === "max") {
      deleteBtn = `<button class="delete-btn" onclick="removeLink(${idx})">Delete</button>`;
    }

    row.innerHTML = `
      <span><strong>${link.name}</strong></span>
      <div class="link-actions">
        <button onclick="window.open('${link.url}', '_blank')">Launch Link</button>
        ${deleteBtn}
      </div>
    `;
    container.appendChild(row);
  });
}

function addNewLink() {
  const name = document.getElementById("newLinkName").value.trim();
  const url = document.getElementById("newLinkUrl").value.trim();

  if (name && url) {
    if (!directoryData[selectedCategory]) directoryData[selectedCategory] = [];
    directoryData[selectedCategory].push({ name: name, url: url });
    saveDirectory();
    document.getElementById("newLinkName").value = "";
    document.getElementById("newLinkUrl").value = "";
    renderLinks();
  }
}

function removeLink(index) {
  directoryData[selectedCategory].splice(index, 1);
  saveDirectory();
  renderLinks();
}

// --- 7. DEDICATED MAX CONTROL PANEL ---
function renderMaxUserTable() {
  const container = document.getElementById("usersListContainer");
  container.innerHTML = "";

  usersDB.forEach((u, idx) => {
    if (u.role === "max") return; // Protect Max root user (mahassan4)

    const row = document.createElement("div");
    row.className = "user-row";
    row.innerHTML = `
      <span><strong>${u.username}</strong></span>
      <div>
        <span>Role: </span>
        <select onchange="updateUserRole(${idx}, this.value)">
          <option value="viewer" ${u.role === 'viewer' ? 'selected' : ''}>Viewer</option>
          <option value="editor" ${u.role === 'editor' ? 'selected' : ''}>Editor</option>
        </select>
        <button class="delete-btn" onclick="removeUserByMax(${idx})">Remove User</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function addUserByMax() {
  const uName = document.getElementById("newUsername").value.trim();
  const uPass = document.getElementById("newPassword").value.trim();
  const uRole = document.getElementById("newRole").value;

  if (uName && uPass) {
    usersDB.push({ username: uName, password: uPass, role: uRole });
    saveUsers();
    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
    renderMaxUserTable();
  }
}

function updateUserRole(index, newRole) {
  usersDB[index].role = newRole;
  saveUsers();
}

function removeUserByMax(index) {
  usersDB.splice(index, 1);
  saveUsers();
  renderMaxUserTable();
}

// --- 8. MODAL HELPERS ---
function openModal(id) {
  document.getElementById(id).style.display = "flex";
  if (id === "maxModal") renderMaxUserTable();
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}
