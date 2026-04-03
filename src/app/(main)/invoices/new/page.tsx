'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { invoiceService, InvoiceItem } from '@/services/invoiceService';
import { clientService, Client } from '@/services/clientService';
import { formatCurrency } from '@/utils/formatCurrency';
import { HiOutlinePlusCircle, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi2';
import Link from 'next/link';

const EMPTY_ITEM: InvoiceItem = { description: '', quantity: 1, rate: 0, amount: 0 };

export default function NewInvoicePage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);
    const [form, setForm] = useState({
        clientId: '', clientName: '', clientEmail: '', clientAddress: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        taxRate: 18,
        notes: '',
        status: 'draft',
        currency: 'INR',
    });

    useEffect(() => {
        clientService.findAll().then(r => setClients(r.data)).catch(() => {});
    }, []);

    const handleClientChange = (id: string) => {
        const c = clients.find(c => c.id === id);
        if (c) setForm(f => ({ ...f, clientId: c.id, clientName: c.name, clientEmail: c.email || '', clientAddress: c.address || '' }));
        else setForm(f => ({ ...f, clientId: '', clientName: '', clientEmail: '', clientAddress: '' }));
    };

    const updateItem = (i: number, field: keyof InvoiceItem, val: string | number) => {
        setItems(prev => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: val };
            if (field === 'quantity' || field === 'rate') {
                next[i].amount = Number(next[i].quantity) * Number(next[i].rate);
            }
            return next;
        });
    };

    const subtotal = items.reduce((s, i) => s + Number(i.amount), 0);
    const taxAmount = (subtotal * Number(form.taxRate)) / 100;
    const total = subtotal + taxAmount;

    const handleSubmit = async (e: React.FormEvent, status = form.status) => {
        e.preventDefault();
        setSaving(true);
        try {
            await invoiceService.create({ ...form, status: status as any, items, subtotal, taxAmount, total });
            router.push('/invoices');
        } finally { setSaving(false); }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/invoices" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">New Invoice</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Create a professional invoice for your client</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                    {/* Client & Details */}
                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-slate-900">Client Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-sm">Select Existing Client</label>
                                <select className="input-field" value={form.clientId} onChange={e => handleClientChange(e.target.value)}>
                                    <option value="">— Enter manually —</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-sm">Client Name *</label>
                                <input className="input-field" placeholder="Client / Company name" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="label-sm">Client Email</label>
                                <input className="input-field" type="email" placeholder="client@company.com" value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label-sm">Client Address</label>
                                <input className="input-field" placeholder="Address" value={form.clientAddress} onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))} />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-slate-900">Invoice Details</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="label-sm">Issue Date *</label>
                                <input className="input-field" type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="label-sm">Due Date</label>
                                <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label-sm">Status</label>
                                <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-sm">GST Rate (%)</label>
                                <input className="input-field" type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900">Line Items</h2>
                            <button type="button" onClick={() => setItems(p => [...p, { ...EMPTY_ITEM }])}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                <HiOutlinePlusCircle className="w-4 h-4" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">
                                <div className="col-span-5">Description</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Rate (₹)</div>
                                <div className="col-span-2 text-right">Amount</div>
                                <div className="col-span-1"></div>
                            </div>

                            {items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-12 sm:col-span-5">
                                        <input className="input-field" placeholder="Service / product description" value={item.description}
                                            onChange={e => updateItem(i, 'description', e.target.value)} />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <input className="input-field text-center" type="number" min="1" step="1" value={item.quantity}
                                            onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <input className="input-field text-right" type="number" min="0" step="0.01" value={item.rate}
                                            onChange={e => updateItem(i, 'rate', Number(e.target.value))} />
                                    </div>
                                    <div className="col-span-3 sm:col-span-2 text-right">
                                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        {items.length > 1 && (
                                            <button type="button" onClick={() => setItems(p => p.filter((_, j) => j !== i))}
                                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-slate-100 pt-4 mt-4">
                            <div className="max-w-xs ml-auto space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">GST ({form.taxRate}%)</span>
                                    <span className="font-medium text-slate-900">{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between text-base border-t border-slate-200 pt-2 mt-2">
                                    <span className="font-bold text-slate-900">Total</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="card p-6">
                        <label className="label-sm">Notes / Terms</label>
                        <textarea className="input-field min-h-[80px] resize-none mt-1" placeholder="Payment terms, bank details, thank you message..."
                            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Link href="/invoices" className="btn-secondary">Cancel</Link>
                        <button type="submit" disabled={saving} className="btn-secondary" onClick={e => { setForm(f => ({ ...f, status: 'draft' })); }}>
                            {saving ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button type="button" disabled={saving} className="btn-primary"
                            onClick={async (e) => {
                                setSaving(true);
                                try {
                                    await invoiceService.create({ ...form, status: 'sent', items, subtotal, taxAmount, total });
                                    router.push('/invoices');
                                } finally { setSaving(false); }
                            }}>
                            {saving ? 'Saving...' : 'Save & Send'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
