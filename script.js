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

// --- 1. State Management (Mock Database) ---
let tools = [
    { id: 1, name: "Power Drill", category: "Power Tools", totalQty: 3, availableQty: 3 },
    { id: 2, name: "Claw Hammer", category: "Hand Tools", totalQty: 5, availableQty: 5 },
    { id: 3, name: "Lawn Mower", category: "Gardening", totalQty: 1, availableQty: 1 },
    { id: 4, name: "Screwdriver Set", category: "Hand Tools", totalQty: 4, availableQty: 4 },
    { id: 5, name: "Circular Saw", category: "Power Tools", totalQty: 2, availableQty: 2 }
];

let transactions = [];
