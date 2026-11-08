/**
 * State Management & LocalStorage Persistence
 */

const STORAGE_KEY = 'sleek_invoices_registry_v1';

// Preset sample matching user's reference image
const SAMPLE_INVOICE = {
  id: 'inv_sample_001',
  invoiceNumber: 'RNY-0032',
  status: 'paid', // paid, pending, draft, overdue
  theme: 'dark', // dark, light
  bannerStyle: 'wave', // wave, minimal, none, custom
  customBannerUrl: '',
  logoIcon: 'circle-dot', // circle-dot, custom-image, initial
  logoCustomUrl: '',
  brandWatermark: 'Runey',
  currency: 'USD',
  issuedDate: '2026-04-02',
  dueDate: '2026-05-02',
  
  // Sisi Pengirim (FROM - Kop Universal)
  sender: {
    name: 'Solt Wagner',
    email: 'soltwagner@gmail.com',
    address: '1547 Wilson Street',
    city: 'San Diego',
    state: 'California',
    country: 'United States',
    phone: '+1 234 5678',
    website: 'www.runey.app',
    taxId: 'EU9876543210'
  },
  
  // Sisi Penerima (BILL TO)
  client: {
    name: 'Ana Morales',
    email: 'ana@solcraft.mx',
    address: 'Av. Reforma 222, CDMX 06600',
    taxId: 'EU123456789'
  },
  
  // Item Barang / Jasa
  items: [
    { id: 'item_1', description: 'Logo', qty: 1, rate: 1900 },
    { id: 'item_2', description: 'Website design', qty: 1, rate: 2500 },
    { id: 'item_3', description: 'Development', qty: 1, rate: 4900 }
  ],
  
  // Pajak & Diskon
  taxPercent: 15,
  discountValue: 0,
  discountType: 'percent',
  
  // Detail Pembayaran
  payment: {
    method: 'Bank Transfer',
    bankName: 'Bank',
    accountNumber: '1234 5678 9877 1235',
    routingCode: 'EU12355',
    accountHolder: 'Solt Wagner'
  },
  
  // Catatan
  notes: 'Thank you for your business!',
  attachments: [], // Lampiran foto nota / bukti pengeluaran
  createdAt: '2026-04-02T10:00:00Z',
  updatedAt: '2026-04-02T10:00:00Z'
};

class InvoiceStore {
  constructor() {
    this.invoices = this.loadAll();
    this.currentInvoice = null;
    
    // Seed initial sample invoice if store is empty
    if (this.invoices.length === 0) {
      this.invoices.push(SAMPLE_INVOICE);
      this.persist();
    }
  }

  loadAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading invoices from localStorage:', e);
      return [];
    }
  }

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.invoices));
    } catch (e) {
      console.error('Error persisting invoices to localStorage:', e);
    }
  }

  getAll() {
    return this.invoices.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  getById(id) {
    return this.invoices.find(inv => inv.id === id) || null;
  }

  createBlank() {
    const nextSeq = this.invoices.length + 1;
    const padded = String(nextSeq).padStart(4, '0');
    const today = new Date().toISOString().split('T')[0];
    
    // 30 days due
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    const dueDay = dueDateObj.toISOString().split('T')[0];

    const newInvoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: `INV-${padded}`,
      status: 'pending',
      theme: 'dark',
      bannerStyle: 'wave',
      customBannerUrl: '',
      logoIcon: 'circle-dot',
      logoCustomUrl: '',
      brandWatermark: 'INVOICE',
      currency: 'IDR',
      issuedDate: today,
      dueDate: dueDay,
      sender: {
        name: 'Nama Perusahaan / Studio Anda',
        email: 'kontak@perusahaan.com',
        address: 'Jl. Jenderal Sudirman No. 12',
        city: 'Jakarta Selatan',
        state: 'DKI Jakarta',
        country: 'Indonesia',
        phone: '+62 812 3456 7890',
        website: 'www.website.com',
        taxId: '01.234.567.8-901.000'
      },
      client: {
        name: 'Nama Klien / Perusahaan',
        email: 'client@company.com',
        address: 'Jl. Thamrin No. 45, Jakarta Pusat',
        taxId: ''
      },
      items: [
        { id: 'item_' + Date.now(), description: 'Jasa Desain & Produksi Konten', qty: 1, rate: 3500000 }
      ],
      taxPercent: 11,
      discountValue: 0,
      discountType: 'percent',
      payment: {
        method: 'Bank Transfer',
        bankName: 'BCA (Bank Central Asia)',
        accountNumber: '123-456-7890',
        routingCode: '',
        accountHolder: 'Nama Rekening Anda'
      },
      notes: 'Terima kasih atas kerja sama dan kepercayaannya.',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newInvoice;
  }

  save(invoice) {
    const index = this.invoices.findIndex(inv => inv.id === invoice.id);
    invoice.updatedAt = new Date().toISOString();
    
    if (index >= 0) {
      this.invoices[index] = { ...invoice };
    } else {
      invoice.createdAt = invoice.createdAt || new Date().toISOString();
      this.invoices.unshift({ ...invoice });
    }
    
    this.persist();
    return invoice;
  }

  duplicate(id) {
    const source = this.getById(id);
    if (!source) return null;

    const cloned = JSON.parse(JSON.stringify(source));
    cloned.id = 'inv_' + Date.now();
    const nextSeq = this.invoices.length + 1;
    cloned.invoiceNumber = source.invoiceNumber + '-COPY';
    cloned.status = 'draft';
    cloned.createdAt = new Date().toISOString();
    cloned.updatedAt = new Date().toISOString();

    this.invoices.unshift(cloned);
    this.persist();
    return cloned;
  }

  delete(id) {
    this.invoices = this.invoices.filter(inv => inv.id !== id);
    this.persist();
  }
}

window.invoiceStore = new InvoiceStore();
