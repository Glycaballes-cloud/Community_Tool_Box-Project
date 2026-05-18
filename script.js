/* =========================================================
   DOM ELEMENT SELECTORS
========================================================= */
const dom = {
  sections: () => document.querySelectorAll('.section'),
  navItems: () => document.querySelectorAll('.nav-links li'),

  toolboxBody: () => document.getElementById('toolbox-body'),
  historyBody: () => document.getElementById('history-body'),

  searchInput: () => document.getElementById('searchInput'),
  categoryFilter: () => document.getElementById('categoryFilter'),
  statusFilter: () => document.getElementById('statusFilter'),

  modal: () => document.getElementById('borrowModal'),
  modalToolName: () => document.getElementById('modalToolName'),
  modalToolId: () => document.getElementById('modalToolId'),

  borrowerName: () => document.getElementById('bName'),
  borrowerContact: () => document.getElementById('bContact'),
  borrowerAddress: () => document.getElementById('bAddress'),
  borrowerReturnDate: () => document.getElementById('bReturnDate'),

  statTotal: () => document.getElementById('stat-total'),
  statAvailable: () => document.getElementById('stat-available'),
  statBorrowed: () => document.getElementById('stat-borrowed'),
  statMostBorrowed: () => document.getElementById('stat-most-borrowed'),
  statAvgDuration: () => document.getElementById('stat-avg-duration'),

  contribName: () => document.getElementById('contrib-name'),
  contribCategory: () => document.getElementById('contrib-category'),
  contribDesc: () => document.getElementById('contrib-desc'),

  toolList: () => document.getElementById('tool-list')
  
};


/* =========================================================
   STATE MANAGEMENT
========================================================= */
let tools = [
  { id: 1, name: "Power Drill", category: "Power Tools", totalQty: 3, availableQty: 3 },
  { id: 2, name: "Claw Hammer", category: "Hand Tools", totalQty: 5, availableQty: 5 },
  { id: 3, name: "Lawn Mower", category: "Gardening", totalQty: 1, availableQty: 1 },
  { id: 4, name: "Screwdriver Set", category: "Hand Tools", totalQty: 4, availableQty: 4 },
  { id: 5, name: "Circular Saw", category: "Power Tools", totalQty: 2, availableQty: 2 }
];

let transactions = [];
let inventory = [];
let historyLog = [];

/* ---------- Navigation ---------- */
function navigate(sectionId) {
  hideAllSections();
  deactivateNavItems();

  document.getElementById(sectionId).classList.add('active');
  document.getElementById(`nav-${sectionId}`).classList.add('active');

  renderSection(sectionId);
}


/* ---------- Dashboard ---------- */
function renderDashboard() {
  const totalTools = tools.reduce((sum, t) => sum + t.totalQty, 0);
  const availableTools = tools.reduce((sum, t) => sum + t.availableQty, 0);

  dom.statTotal().innerText = totalTools;
  dom.statAvailable().innerText = availableTools;
  dom.statBorrowed().innerText = totalTools - availableTools;

  calculateUtilizationData();
}


/* ---------- Toolbox ---------- */
function renderToolbox() {
  const tbody = dom.toolboxBody();
  tbody.innerHTML = '';

  const searchStr = dom.searchInput().value.toLowerCase();
  const category = dom.categoryFilter().value;
  const status = dom.statusFilter().value;

  tools
    .filter(tool => filterTool(tool, searchStr, category, status))
    .forEach(tool => tbody.appendChild(createToolRow(tool)));
}


/* ---------- Borrowing ---------- */
function openBorrowModal(toolId) {
  const tool = tools.find(t => t.id === toolId);

  dom.modalToolName().innerText = tool.name;
  dom.modalToolId().value = tool.id;
  dom.borrowerReturnDate().value = getDefaultReturnDate();

  dom.modal().classList.add('active');
}

function closeModal() {
  dom.modal().classList.remove('active');
  clearBorrowForm();
}

function submitBorrow() {
  const data = getBorrowFormData();

  if (!validateBorrowForm(data)) {
    alert("Please fill out all borrower details.");
    return;
  }

  processBorrow(data);
}


/* ---------- Transactions ---------- */
function renderHistory() {
  const tbody = dom.historyBody();
  tbody.innerHTML = '';

  const sorted = [...transactions].sort((a, b) => b.id - a.id);

  if (!sorted.length) {
    return renderEmptyHistory(tbody);
  }

  sorted.forEach(tx => tbody.appendChild(createHistoryRow(tx)));
}

function returnTool(transactionId) {
  const tx = transactions.find(t => t.id === transactionId);
  const tool = tools.find(t => t.id === tx.toolId);

  if (!confirm(`Confirm ${tx.toolName} has been returned by ${tx.borrowerName}?`)) return;

  historyLog.push({
    type: "Returned",
    toolName: tx.toolName,
    details: `${tx.borrowerName} returned tool`,
    date: new Date().toLocaleString()
  });

  tx.status = 'Completed';
  tool.availableQty++;

  renderHistory();
}

/* ---------- History Log ---------- */
function renderHistoryLog() {
  const tbody = document.getElementById('historylog-body');
  tbody.innerHTML = '';

  if (!historyLog.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; color:#888;">
          No history yet.
        </td>
      </tr>
    `;
    return;
  }

  [...historyLog].reverse().forEach(entry => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td><strong>${entry.type}</strong></td>
      <td>${entry.toolName}</td>
      <td>${entry.details}</td>
      <td>${entry.date}</td>
    `;

    tbody.appendChild(tr);
  });
}
``

/* ---------- Contributions ---------- */
function contributeTool() {
  const name = dom.contribName().value.trim();
  const category = dom.contribCategory().value;

  if (!name) {
    alert("Please enter a tool name.");
    return;
  }

  const existing = tools.find(t => t.name.toLowerCase() === name.toLowerCase());

  let toolName;

  if (existing) {
    existing.totalQty++;
    existing.availableQty++;
    toolName = existing.name;
  } else {
    const newTool = createNewTool(name, category);
    tools.push(newTool);
    toolName = newTool.name;
  }

  // ✅ ADD HISTORY ENTRY
  historyLog.push({
    type: "Added",
    toolName: toolName,
    details: "Tool added to system",
    date: new Date().toLocaleString()
  });

  clearContributionForm();
  refreshUI();
}


/* =========================================================
   6. UTILITY / HELPER FUNCTIONS
========================================================= */

/* ---------- Navigation Helpers ---------- */
const hideAllSections = () =>
  dom.sections().forEach(sec => sec.classList.remove('active'));

const deactivateNavItems = () =>
  dom.navItems().forEach(item => item.classList.remove('active'));

function renderSection(id) {
  if (id === 'home') renderDashboard();
  if (id === 'toolbox') renderToolbox();
  if (id === 'history') renderHistory();
   if (id === 'historylog') renderHistoryLog();
}


/* ---------- Toolbox Helpers ---------- */
function filterTool(tool, search, category, status) {
  if (search && !tool.name.toLowerCase().includes(search)) return false;
  if (category !== 'all' && tool.category !== category) return false;
  if (status === 'available' && tool.availableQty === 0) return false;
  if (status === 'borrowed' && tool.availableQty > 0) return false;
  return true;
}

function createToolRow(tool) {
  const tr = document.createElement('tr');

  const badge = tool.availableQty > 0
    ? `<span class="badge available">Available</span>`
    : `<span class="badge borrowed">Borrowed</span>`;

  tr.innerHTML = `
    <td><strong>${tool.name}</strong></td>
    <td>${tool.category}</td>
    <td>${tool.availableQty} / ${tool.totalQty}</td>
    <td>${badge}</td>
    <td>
      <button class="btn btn-action"
        ${tool.availableQty === 0 ? 'disabled' : ''}
        onclick="openBorrowModal(${tool.id})">
        Borrow
      </button>
    </td>
  `;

  return tr;
}


/* ---------- Borrow Helpers ---------- */
function getBorrowFormData() {
  return {
    toolId: parseInt(dom.modalToolId().value),
    name: dom.borrowerName().value,
    contact: dom.borrowerContact().value,
    address: dom.borrowerAddress().value,
    returnDate: dom.borrowerReturnDate().value,
    dateBorrowed: new Date().toISOString().split('T')[0]
  };
}

function validateBorrowForm(data) {
  return data.name && data.contact && data.address && data.returnDate;
}

function processBorrow(data) {
  const tool = tools.find(t => t.id === data.toolId);

  tool.availableQty--;

  transactions.push({
    id: Date.now(),
    toolId: tool.id,
    toolName: tool.name,
    borrowerName: data.name,
    contact: data.contact,
    address: data.address,
    dateBorrowed: data.dateBorrowed,
    expectedReturn: data.returnDate,
    status: 'Ongoing'
  });

  historyLog.push({
    type: "Borrowed",
    toolName: tool.name,
    details: `${data.name} borrowed (${data.contact})`,
    date: new Date().toLocaleString()
  });

  closeModal();
  renderToolbox();

  alert(`${tool.name} successfully borrowed by ${data.name}!`);
}

const getDefaultReturnDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
};

const clearBorrowForm = () => {
  dom.borrowerName().value = '';
  dom.borrowerContact().value = '';
  dom.borrowerAddress().value = '';
};


/* ---------- History Helpers ---------- */
function createHistoryRow(tx) {
  const tr = document.createElement('tr');

  const badge = tx.status === 'Ongoing'
    ? `<span class="badge ongoing">Ongoing</span>`
    : `<span class="badge completed">Returned</span>`;

  tr.innerHTML = `
    <td><strong>${tx.toolName}</strong></td>
    <td>
      <div>👤 ${tx.borrowerName}</div>
      <small>📞 ${tx.contact} 🏠 ${tx.address}</small>
    </td>
    <td>
      <div><strong>Out:</strong> ${tx.dateBorrowed}</div>
      <small><strong>Due:</strong> ${tx.expectedReturn}</small>
    </td>
    <td>${badge}</td>
    <td>
      ${tx.status === 'Ongoing'
        ? `<button class="btn btn-primary" onclick="returnTool(${tx.id})">Mark Returned</button>`
        : '-'}
    </td>
  `;

  return tr;
}

function renderEmptyHistory(tbody) {
  tbody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center; color:#888;">
        No transactions recorded yet.
      </td>
    </tr>
  `;
}


/* ---------- Contribution Helpers ---------- */
function createNewTool(name, category) {
  return {
    id: tools.length + 1,
    name,
    category,
    totalQty: 1,
    availableQty: 1
  };
}

function clearContributionForm() {
  dom.contribName().value = '';
  dom.contribDesc().value = '';
}

function refreshUI() {
  renderToolbox();
  renderDashboard();
  renderInventoryList(); 
}


/* ---------- Analytics Helpers ---------- */
function calculateUtilizationData() {
  if (!transactions.length) {
    dom.statMostBorrowed().innerText = '-';
    dom.statAvgDuration().innerText = '-';
    return;
  }

  const borrowCounts = {};
  let totalDuration = 0;
  let count = 0;

  transactions.forEach(tx => {
   borrowCounts[tx.toolName] = (borrowCounts[tx.toolName] || 0) + 1;

    if (tx.dateBorrowed && tx.expectedReturn) {
      const days = (new Date(tx.expectedReturn) - new Date(tx.dateBorrowed)) / (1000 * 60 * 60 * 24);
      if (days > 0) {
        totalDuration += days;
        count++;
      }
    }
  });

  const mostBorrowed = Object.entries(borrowCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  const avg = count ? `${(totalDuration / count / 7).toFixed(1)} weeks` : '-';

  dom.statMostBorrowed().innerText = mostBorrowed;
  dom.statAvgDuration().innerText = avg;
}

function renderInventoryList() {
  const list = dom.toolList();
  list.innerHTML = '';

  tools.forEach(tool => {
    const li = document.createElement('li');
    li.textContent = `${tool.name} (${tool.availableQty}/${tool.totalQty})`;
    list.appendChild(li);
  });
}

/* =========================================================
   INITIALIZATION
========================================================= */
renderDashboard();
