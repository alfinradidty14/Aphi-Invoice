/**
 * Main Application Controller
 */

let currentInvoice = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Navigation / View Switching
  const btnNewInvoice = document.getElementById('btn-new-invoice');
  const btnBackDashboard = document.getElementById('btn-back-dashboard');
  const btnSaveInvoice = document.getElementById('btn-save-invoice');
  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  const btnPrintInvoice = document.getElementById('btn-print-invoice');
  const btnAddFirstInvoice = document.getElementById('btn-add-first-invoice');

  if (btnNewInvoice) btnNewInvoice.addEventListener('click', handleCreateNewInvoice);
  if (btnAddFirstInvoice) btnAddFirstInvoice.addEventListener('click', handleCreateNewInvoice);
  if (btnBackDashboard) btnBackDashboard.addEventListener('click', showDashboardView);
  if (btnSaveInvoice) btnSaveInvoice.addEventListener('click', handleSaveCurrentInvoice);
  if (btnDownloadPdf) btnDownloadPdf.addEventListener('click', handleDownloadPdf);
  if (btnPrintInvoice) btnPrintInvoice.addEventListener('click', () => window.print());

  // Search & Filter Listeners on Dashboard
  const searchInput = document.getElementById('search-invoices');
  if (searchInput) searchInput.addEventListener('input', renderDashboardInvoices);

  const statusFilters = document.querySelectorAll('.filter-status-btn');
  statusFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      statusFilters.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('text-slate-400', 'hover:text-white');
      });
      e.currentTarget.classList.add('bg-blue-600', 'text-white');
      e.currentTarget.classList.remove('text-slate-400', 'hover:text-white');
      renderDashboardInvoices();
    });
  });

  // Setup form event delegation for live preview updates
  setupFormEventListeners();

  // Render initial dashboard view
  renderDashboard();
}

/**
 * View Management
 */
function showDashboardView() {
  document.getElementById('view-dashboard').classList.remove('hidden');
  document.getElementById('view-editor').classList.add('hidden');
  renderDashboard();
}

function showEditorView(invoice) {
  currentInvoice = JSON.parse(JSON.stringify(invoice));
  document.getElementById('view-dashboard').classList.add('hidden');
  document.getElementById('view-editor').classList.remove('hidden');

  populateFormWithInvoice(currentInvoice);
  renderLivePreview();
}

/**
 * Dashboard Rendering
 */
function renderDashboard() {
  const allInvoices = window.invoiceStore.getAll();

  // Render metrics
  let totalValue = 0;
  let paidCount = 0;
  let pendingCount = 0;

  allInvoices.forEach(inv => {
    const totals = window.InvoiceCalc.calculateInvoiceTotals(inv.items, inv.taxPercent, inv.discountValue, inv.discountType);
    totalValue += totals.grandTotal;
    if (inv.status === 'paid') paidCount++;
    if (inv.status === 'pending') pendingCount++;
  });

  document.getElementById('stat-total-invoices').textContent = allInvoices.length;
  document.getElementById('stat-paid-count').textContent = paidCount;
  document.getElementById('stat-pending-count').textContent = pendingCount;
  
  // Format total currency based on first invoice or IDR
  const primaryCurr = allInvoices[0]?.currency || 'IDR';
  document.getElementById('stat-total-amount').textContent = window.InvoiceCalc.formatCurrency(totalValue, primaryCurr);

  renderDashboardInvoices();
}

function renderDashboardInvoices() {
  const container = document.getElementById('invoices-list-tbody');
  const emptyState = document.getElementById('invoices-empty-state');
  const allInvoices = window.invoiceStore.getAll();
  
  const searchKeyword = (document.getElementById('search-invoices')?.value || '').toLowerCase().trim();
  const activeFilterBtn = document.querySelector('.filter-status-btn.bg-blue-600');
  const selectedStatus = activeFilterBtn?.dataset.status || 'all';

  const filtered = allInvoices.filter(inv => {
    const matchesSearch = 
      (inv.invoiceNumber || '').toLowerCase().includes(searchKeyword) ||
      (inv.client?.name || '').toLowerCase().includes(searchKeyword) ||
      (inv.sender?.name || '').toLowerCase().includes(searchKeyword);

    const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(inv => {
    const totals = window.InvoiceCalc.calculateInvoiceTotals(inv.items, inv.taxPercent, inv.discountValue, inv.discountType);
    const formattedTotal = window.InvoiceCalc.formatCurrency(totals.grandTotal, inv.currency);

    const statusBadges = {
      paid: '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAID</span>',
      pending: '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>',
      draft: '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">DRAFT</span>',
      overdue: '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">OVERDUE</span>'
    };

    return `
      <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
        <td class="py-4 px-4 font-mono font-medium text-white">
          <span class="inline-flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${inv.theme === 'dark' ? 'bg-indigo-400' : 'bg-slate-300'}"></span>
            ${inv.invoiceNumber}
          </span>
        </td>
        <td class="py-4 px-4">
          <div class="font-medium text-slate-200">${inv.client?.name || '-'}</div>
          <div class="text-xs text-slate-400">${inv.client?.email || ''}</div>
        </td>
        <td class="py-4 px-4 text-xs text-slate-300">
          <div>Terbit: <span class="text-slate-400">${inv.issuedDate || '-'}</span></div>
          <div>Tempo: <span class="text-slate-400">${inv.dueDate || '-'}</span></div>
        </td>
        <td class="py-4 px-4 font-semibold text-white">
          ${formattedTotal}
        </td>
        <td class="py-4 px-4">
          ${statusBadges[inv.status] || statusBadges.pending}
        </td>
        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button onclick="handleQuickPdf('${inv.id}')" title="Download PDF Langsung" class="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </button>
            <button onclick="handleEditInvoice('${inv.id}')" title="Edit Invoice" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="handleDuplicateInvoice('${inv.id}')" title="Duplikat" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </button>
            <button onclick="handleDeleteInvoice('${inv.id}')" title="Hapus" class="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Handle Dashboard actions
 */
function handleCreateNewInvoice() {
  const newInv = window.invoiceStore.createBlank();
  showEditorView(newInv);
}

function handleEditInvoice(id) {
  const inv = window.invoiceStore.getById(id);
  if (inv) showEditorView(inv);
}

function handleDuplicateInvoice(id) {
  const cloned = window.invoiceStore.duplicate(id);
  if (cloned) {
    window.InvoicePdf.showToast(`Invoice ${cloned.invoiceNumber} berhasil diduplikat`, 'success');
    renderDashboard();
  }
}

function handleDeleteInvoice(id) {
  if (confirm('Apakah Anda yakin ingin menghapus invoice ini?')) {
    window.invoiceStore.delete(id);
    window.InvoicePdf.showToast('Invoice berhasil dihapus', 'info');
    renderDashboard();
  }
}

function handleQuickPdf(id) {
  const inv = window.invoiceStore.getById(id);
  if (!inv) return;
  // Temporarily open editor silently or render in background
  showEditorView(inv);
  setTimeout(() => {
    handleDownloadPdf();
  }, 300);
}

/**
 * Split Form & Live Preview Setup
 */
function populateFormWithInvoice(inv) {
  document.getElementById('input-inv-number').value = inv.invoiceNumber || '';
  document.getElementById('input-inv-status').value = inv.status || 'pending';
  document.getElementById('input-inv-currency').value = inv.currency || 'USD';
  document.getElementById('input-inv-theme').value = inv.theme || 'dark';
  document.getElementById('input-inv-banner').value = inv.bannerStyle || 'wave';
  document.getElementById('input-inv-watermark').value = inv.brandWatermark || '';
  
  document.getElementById('input-date-issued').value = inv.issuedDate || '';
  document.getElementById('input-date-due').value = inv.dueDate || '';

  // Sender (KOP Universal)
  document.getElementById('input-sender-name').value = inv.sender?.name || '';
  document.getElementById('input-sender-email').value = inv.sender?.email || '';
  document.getElementById('input-sender-address').value = inv.sender?.address || '';
  document.getElementById('input-sender-city').value = inv.sender?.city || '';
  document.getElementById('input-sender-state').value = inv.sender?.state || '';
  document.getElementById('input-sender-country').value = inv.sender?.country || '';
  document.getElementById('input-sender-phone').value = inv.sender?.phone || '';
  document.getElementById('input-sender-website').value = inv.sender?.website || '';
  document.getElementById('input-sender-taxid').value = inv.sender?.taxId || '';

  // Client (BILL TO)
  document.getElementById('input-client-name').value = inv.client?.name || '';
  document.getElementById('input-client-email').value = inv.client?.email || '';
  document.getElementById('input-client-address').value = inv.client?.address || '';
  document.getElementById('input-client-taxid').value = inv.client?.taxId || '';

  // Tax & Discount
  document.getElementById('input-tax-percent').value = inv.taxPercent ?? 0;
  document.getElementById('input-discount-val').value = inv.discountValue ?? 0;

  // Payment
  document.getElementById('input-pay-method').value = inv.payment?.method || 'Bank Transfer';
  document.getElementById('input-pay-bank').value = inv.payment?.bankName || '';
  document.getElementById('input-pay-account').value = inv.payment?.accountNumber || '';
  document.getElementById('input-pay-routing').value = inv.payment?.routingCode || '';

  // Notes
  document.getElementById('input-notes').value = inv.notes || '';

  // Render items rows in form
  renderFormItems(inv.items || []);
}

function renderFormItems(items) {
  const container = document.getElementById('form-items-container');
  container.innerHTML = items.map((item, index) => `
    <div class="item-row p-3 rounded-lg bg-black/30 border border-white/5 space-y-2" data-item-id="${item.id}">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-mono text-slate-400">#${index + 1}</span>
        <button type="button" class="btn-remove-item text-xs text-rose-400 hover:text-rose-300 transition-colors p-1" onclick="handleRemoveItem('${item.id}')">
          Hapus
        </button>
      </div>
      <div>
        <input type="text" class="input-dark text-xs item-desc" placeholder="Deskripsi barang / jasa" value="${item.description || ''}" oninput="syncFormToCurrentInvoice()">
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Qty</label>
          <input type="number" step="any" min="0" class="input-dark text-xs item-qty" value="${item.qty || 1}" oninput="syncFormToCurrentInvoice()">
        </div>
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Harga Satuan (Rate)</label>
          <input type="number" step="any" min="0" class="input-dark text-xs item-rate" value="${item.rate || 0}" oninput="syncFormToCurrentInvoice()">
        </div>
      </div>
    </div>
  `).join('');
}

function handleAddItem() {
  if (!currentInvoice) return;
  const newItem = {
    id: 'item_' + Date.now(),
    description: '',
    qty: 1,
    rate: 0
  };
  currentInvoice.items.push(newItem);
  renderFormItems(currentInvoice.items);
  renderLivePreview();
}

function handleRemoveItem(itemId) {
  if (!currentInvoice) return;
  if (currentInvoice.items.length <= 1) {
    window.InvoicePdf.showToast('Minimal harus ada 1 baris item', 'warning');
    return;
  }
  currentInvoice.items = currentInvoice.items.filter(it => it.id !== itemId);
  renderFormItems(currentInvoice.items);
  renderLivePreview();
}

function setupFormEventListeners() {
  const form = document.getElementById('invoice-form');
  if (form) {
    form.addEventListener('input', () => {
      syncFormToCurrentInvoice();
    });
    form.addEventListener('change', () => {
      syncFormToCurrentInvoice();
    });
  }

  const btnAddItem = document.getElementById('btn-add-item');
  if (btnAddItem) {
    btnAddItem.addEventListener('click', handleAddItem);
  }
}

function syncFormToCurrentInvoice() {
  if (!currentInvoice) return;

  currentInvoice.invoiceNumber = document.getElementById('input-inv-number').value;
  currentInvoice.status = document.getElementById('input-inv-status').value;
  currentInvoice.currency = document.getElementById('input-inv-currency').value;
  currentInvoice.theme = document.getElementById('input-inv-theme').value;
  currentInvoice.bannerStyle = document.getElementById('input-inv-banner').value;
  currentInvoice.brandWatermark = document.getElementById('input-inv-watermark').value;

  currentInvoice.issuedDate = document.getElementById('input-date-issued').value;
  currentInvoice.dueDate = document.getElementById('input-date-due').value;

  // Sender
  currentInvoice.sender = {
    name: document.getElementById('input-sender-name').value,
    email: document.getElementById('input-sender-email').value,
    address: document.getElementById('input-sender-address').value,
    city: document.getElementById('input-sender-city').value,
    state: document.getElementById('input-sender-state').value,
    country: document.getElementById('input-sender-country').value,
    phone: document.getElementById('input-sender-phone').value,
    website: document.getElementById('input-sender-website').value,
    taxId: document.getElementById('input-sender-taxid').value
  };

  // Client
  currentInvoice.client = {
    name: document.getElementById('input-client-name').value,
    email: document.getElementById('input-client-email').value,
    address: document.getElementById('input-client-address').value,
    taxId: document.getElementById('input-client-taxid').value
  };

  // Tax & Discount
  currentInvoice.taxPercent = Number(document.getElementById('input-tax-percent').value) || 0;
  currentInvoice.discountValue = Number(document.getElementById('input-discount-val').value) || 0;

  // Payment
  currentInvoice.payment = {
    method: document.getElementById('input-pay-method').value,
    bankName: document.getElementById('input-pay-bank').value,
    accountNumber: document.getElementById('input-pay-account').value,
    routingCode: document.getElementById('input-pay-routing').value
  };

  // Notes
  currentInvoice.notes = document.getElementById('input-notes').value;

  // Items from DOM
  const itemRows = document.querySelectorAll('.item-row');
  const items = [];
  itemRows.forEach(row => {
    const id = row.dataset.itemId;
    const desc = row.querySelector('.item-desc')?.value || '';
    const qty = Number(row.querySelector('.item-qty')?.value) || 0;
    const rate = Number(row.querySelector('.item-rate')?.value) || 0;
    items.push({ id, description: desc, qty, rate });
  });
  currentInvoice.items = items;

  renderLivePreview();
}

/**
 * Render the Live Preview (Matching Reference Image)
 */
function renderLivePreview() {
  if (!currentInvoice) return;

  const inv = currentInvoice;
  const container = document.getElementById('invoice-paper-preview');
  if (!container) return;

  // Apply Theme class
  container.className = `invoice-paper ${inv.theme === 'dark' ? 'invoice-theme-dark' : 'invoice-theme-light'} relative p-8 md:p-12 transition-all`;

  // Banner display
  let bannerHtml = '';
  if (inv.bannerStyle === 'wave') {
    bannerHtml = `
      <div class="w-full h-44 -mt-8 -mx-8 md:-mt-12 md:-mx-12 mb-8 overflow-hidden rounded-t-2xl">
        <img src="assets/banner-wave.svg" alt="Header Wave" class="w-full h-full object-cover">
      </div>
    `;
  } else if (inv.bannerStyle === 'minimal') {
    bannerHtml = `
      <div class="w-full h-32 -mt-8 -mx-8 md:-mt-12 md:-mx-12 mb-8 overflow-hidden rounded-t-2xl">
        <img src="assets/banner-minimal.svg" alt="Header Banner" class="w-full h-full object-cover">
      </div>
    `;
  } else if (inv.bannerStyle === 'custom' && inv.customBannerUrl) {
    bannerHtml = `
      <div class="w-full h-40 -mt-8 -mx-8 md:-mt-12 md:-mx-12 mb-8 overflow-hidden rounded-t-2xl">
        <img src="${inv.customBannerUrl}" alt="Custom Banner" class="w-full h-full object-cover">
      </div>
    `;
  }

  // Calculate totals
  const totals = window.InvoiceCalc.calculateInvoiceTotals(inv.items, inv.taxPercent, inv.discountValue, inv.discountType);
  const formattedSubtotal = window.InvoiceCalc.formatCurrency(totals.subtotal, inv.currency);
  const formattedTax = window.InvoiceCalc.formatCurrency(totals.taxAmount, inv.currency);
  const formattedDiscount = window.InvoiceCalc.formatCurrency(totals.discountAmount, inv.currency);
  const formattedTotal = window.InvoiceCalc.formatCurrency(totals.grandTotal, inv.currency);

  // Date formatters (e.g. Apr 2, 2026)
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const isDark = inv.theme === 'dark';
  const textMuted = isDark ? 'text-neutral-400' : 'text-slate-500';
  const textDim = isDark ? 'text-neutral-500' : 'text-slate-400';
  const textBold = isDark ? 'text-white' : 'text-slate-900';
  const borderCol = isDark ? 'border-neutral-800' : 'border-slate-200';

  container.innerHTML = `
    ${bannerHtml}

    <!-- Top Header: Logo Icon & Invoice Number -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'} shadow-sm">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
            <path d="M12 12L2.5 7.5"></path>
          </svg>
        </div>
      </div>
      <div class="font-mono text-sm tracking-wider font-semibold ${textBold}">
        ${inv.invoiceNumber || 'INV-0001'}
      </div>
    </div>

    <!-- Main Title -->
    <div class="mb-10">
      <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight ${textBold}">
        INVOICE
      </h1>
    </div>

    <!-- 3-Column Metadata: FROM, BILL TO, ISSUED & DUE -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed mb-10 pb-8 border-b ${borderCol}">
      <!-- FROM -->
      <div>
        <div class="text-[10px] font-bold tracking-widest uppercase mb-2 ${textDim}">FROM</div>
        <div class="font-bold text-sm mb-1 ${textBold}">${inv.sender?.name || '-'}</div>
        <div class="${textMuted}">${inv.sender?.email || ''}</div>
        <div class="${textMuted}">${inv.sender?.address || ''}</div>
        <div class="${textMuted}">
          ${[inv.sender?.city, inv.sender?.state, inv.sender?.country].filter(Boolean).join(', ')}
        </div>
        ${inv.sender?.phone ? `<div class="${textMuted}">${inv.sender.phone}</div>` : ''}
        ${inv.sender?.website ? `<div class="${textMuted}">${inv.sender.website}</div>` : ''}
        ${inv.sender?.taxId ? `<div class="${textDim} mt-1 font-mono">Tax ID: ${inv.sender.taxId}</div>` : ''}
      </div>

      <!-- BILL TO -->
      <div>
        <div class="text-[10px] font-bold tracking-widest uppercase mb-2 ${textDim}">BILL TO</div>
        <div class="font-bold text-sm mb-1 ${textBold}">${inv.client?.name || '-'}</div>
        <div class="${textMuted}">${inv.client?.email || ''}</div>
        <div class="${textMuted}">${inv.client?.address || ''}</div>
        ${inv.client?.taxId ? `<div class="${textDim} mt-1 font-mono">Tax ID: ${inv.client.taxId}</div>` : ''}
      </div>

      <!-- ISSUED & DUE -->
      <div class="md:text-right space-y-4">
        <div>
          <div class="text-[10px] font-bold tracking-widest uppercase mb-1 ${textDim}">ISSUED</div>
          <div class="font-medium ${textBold}">${formatDateDisplay(inv.issuedDate)}</div>
        </div>
        <div>
          <div class="text-[10px] font-bold tracking-widest uppercase mb-1 ${textDim}">DUE</div>
          <div class="font-medium ${textBold}">${formatDateDisplay(inv.dueDate)}</div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="mb-8">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b ${borderCol} text-[10px] uppercase tracking-wider font-bold ${textDim}">
            <th class="py-3 font-semibold">DESCRIPTION</th>
            <th class="py-3 text-center w-16 font-semibold">QTY</th>
            <th class="py-3 text-right w-28 font-semibold">RATE</th>
            <th class="py-3 text-right w-32 font-semibold">AMOUNT</th>
          </tr>
        </thead>
        <tbody class="divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-100'}">
          ${(inv.items || []).map(item => {
            const lineTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
            return `
              <tr class="group">
                <td class="py-4 pr-3 font-medium ${textBold}">
                  ${item.description || '-'}
                </td>
                <td class="py-4 px-2 text-center ${textMuted}">
                  ${item.qty || 1}
                </td>
                <td class="py-4 px-2 text-right ${textMuted}">
                  ${window.InvoiceCalc.formatCurrency(item.rate || 0, inv.currency)}
                </td>
                <td class="py-4 pl-2 text-right font-semibold ${textBold}">
                  ${window.InvoiceCalc.formatCurrency(lineTotal, inv.currency)}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totals Calculation Block -->
    <div class="flex flex-col items-end mb-12 text-xs">
      <div class="w-full md:w-64 space-y-2.5">
        <div class="flex justify-between items-center py-1">
          <span class="${textMuted}">Subtotal</span>
          <span class="font-medium ${textBold}">${formattedSubtotal}</span>
        </div>

        ${totals.discountAmount > 0 ? `
          <div class="flex justify-between items-center py-1 text-emerald-400">
            <span>Diskon</span>
            <span>-${formattedDiscount}</span>
          </div>
        ` : ''}

        ${inv.taxPercent > 0 ? `
          <div class="flex justify-between items-center py-1">
            <span class="${textMuted}">Tax (${inv.taxPercent}%)</span>
            <span class="font-medium ${textBold}">${formattedTax}</span>
          </div>
        ` : ''}

        <div class="border-t ${borderCol} pt-3 flex justify-between items-center">
          <span class="text-sm font-bold ${textBold}">Total</span>
          <span class="text-base font-extrabold ${textBold}">${formattedTotal}</span>
        </div>
      </div>
    </div>

    <!-- Bottom: Payment Details & Notes -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs pt-8 border-t ${borderCol}">
      <!-- Payment Details -->
      <div>
        <div class="text-[10px] font-bold tracking-widest uppercase mb-2 ${textDim}">PAYMENT DETAILS</div>
        <div class="space-y-1 ${textMuted}">
          <div>Payment Method: <span class="${textBold}">${inv.payment?.method || 'Bank Transfer'}</span></div>
          <div>Bank: <span class="${textBold}">${inv.payment?.bankName || '-'}</span></div>
          <div>Account: <span class="font-mono ${textBold}">${inv.payment?.accountNumber || '-'}</span></div>
          ${inv.payment?.routingCode ? `<div>Routing/SWIFT: <span class="font-mono ${textBold}">${inv.payment.routingCode}</span></div>` : ''}
        </div>
      </div>

      <!-- Notes -->
      <div>
        <div class="text-[10px] font-bold tracking-widest uppercase mb-2 ${textDim}">NOTES</div>
        <div class="leading-relaxed ${textMuted}">
          ${inv.notes || 'Thank you for your business!'}
        </div>
      </div>
    </div>

    <!-- Watermark / Footer Brand -->
    ${inv.brandWatermark ? `
      <div class="mt-16 pt-6 text-center">
        <span class="text-2xl font-bold tracking-wider ${isDark ? 'text-white/80' : 'text-slate-800'}">
          ${inv.brandWatermark}
        </span>
      </div>
    ` : ''}
  `;
}

function handleSaveCurrentInvoice() {
  if (!currentInvoice) return;
  window.invoiceStore.save(currentInvoice);
  window.InvoicePdf.showToast(`Invoice ${currentInvoice.invoiceNumber} berhasil disimpan!`, 'success');
  renderDashboard();
}

function handleDownloadPdf() {
  if (!currentInvoice) return;
  // Ensure changes are saved
  window.invoiceStore.save(currentInvoice);
  window.InvoicePdf.exportInvoiceToPdf('invoice-paper-preview', currentInvoice);
}

// Global exposure for inline onclick handlers
window.handleQuickPdf = handleQuickPdf;
window.handleEditInvoice = handleEditInvoice;
window.handleDuplicateInvoice = handleDuplicateInvoice;
window.handleDeleteInvoice = handleDeleteInvoice;
window.handleRemoveItem = handleRemoveItem;
window.syncFormToCurrentInvoice = syncFormToCurrentInvoice;
