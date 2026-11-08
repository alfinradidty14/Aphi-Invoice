/**
 * PDF Export & Print Engine
 */

async function exportInvoiceToPdf(elementId = 'invoice-paper-preview', invoice) {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Komponen invoice tidak ditemukan.');
    return;
  }

  const invoiceNumber = invoice?.invoiceNumber || 'INV-0001';
  const clientName = (invoice?.client?.name || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Invoice_${invoiceNumber}_${clientName}.pdf`;

  // Show status notification
  showToast('Memproses dokumen PDF kualitas tinggi...', 'info');

  try {
    // If html2pdf bundle is available via CDN
    if (window.html2pdf) {
      const opt = {
        margin: [0, 0, 0, 0],
        filename: filename,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
          scale: 2.5,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: invoice?.theme === 'dark' ? '#07080a' : '#ffffff',
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      // Clone element temporarily for clean rendering
      await window.html2pdf().set(opt).from(element).save();
      showToast('PDF berhasil diunduh!', 'success');
    } else {
      // Fallback: Native print dialog
      window.print();
      showToast('Membuka dialog cetak browser...', 'info');
    }
  } catch (err) {
    console.error('Gagal generate PDF via html2pdf:', err);
    // Graceful fallback to print
    window.print();
    showToast('Mengalihkan ke dialog cetak / Simpan PDF...', 'warning');
  }
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const colors = {
    info: 'bg-blue-600 text-white',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-600 text-white',
    error: 'bg-rose-600 text-white'
  };

  toast.className = `px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all transform duration-300 opacity-0 translate-y-2 pointer-events-auto flex items-center gap-2 ${colors[type] || colors.info}`;
  toast.innerHTML = `<span>${message}</span>`;

  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  // Animate out after 3.5s
  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.InvoicePdf = {
  exportInvoiceToPdf,
  showToast
};
