'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { invoiceService, Invoice } from '@/services/invoiceService';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePencil, HiOutlineCheckCircle,
    HiOutlinePaperAirplane, HiOutlineDocumentText,
} from 'react-icons/hi2';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
    sent: { label: 'Sent', className: 'bg-blue-50 text-blue-700' },
    paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700' },
    overdue: { label: 'Overdue', className: 'bg-red-50 text-red-600' },
    cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500' },
};

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        invoiceService.findOne(id).then(r => setInvoice(r.data)).finally(() => setLoading(false));
    }, [id]);

    const markAs = async (status: string) => {
        if (!invoice) return;
        const updated = await invoiceService.update(invoice.id, { status: status as any, paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined });
        setInvoice(updated.data);
    };

    const handleDelete = async () => {
        if (!confirm('Delete this invoice?')) return;
        await invoiceService.delete(id);
        router.push('/invoices');
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Loading invoice...</div>;
    if (!invoice) return <div className="p-12 text-center text-slate-500">Invoice not found.</div>;

    const cfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/invoices" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
                        </div>
                        <p className="text-slate-500 text-sm mt-0.5">{invoice.clientName || 'No client specified'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {invoice.status === 'draft' && (
                        <button onClick={() => markAs('sent')} className="btn-secondary flex items-center gap-1.5 text-sm">
                            <HiOutlinePaperAirplane className="w-4 h-4" /> Mark Sent
                        </button>
                    )}
                    {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <button onClick={() => markAs('paid')} className="btn-primary flex items-center gap-1.5 text-sm">
                            <HiOutlineCheckCircle className="w-4 h-4" /> Mark Paid
                        </button>
                    )}
                    <button onClick={handleDelete} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500">
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Invoice Card */}
            <div className="card p-8 space-y-8">
                {/* Invoice header */}
                <div className="flex justify-between flex-wrap gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <HiOutlineDocumentText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">Savora</span>
                        </div>
                        <p className="text-xs text-slate-500">Savora Technologies Pvt Ltd</p>
                        <p className="text-xs text-slate-500">India</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</p>
                        <div className="mt-3 space-y-1">
                            <div className="flex justify-end gap-6 text-sm">
                                <span className="text-slate-500">Issue Date:</span>
                                <span className="font-medium text-slate-900">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                            </div>
                            {invoice.dueDate && (
                                <div className="flex justify-end gap-6 text-sm">
                                    <span className="text-slate-500">Due Date:</span>
                                    <span className="font-medium text-slate-900">{new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            )}
                            {invoice.paidDate && (
                                <div className="flex justify-end gap-6 text-sm">
                                    <span className="text-slate-500">Paid On:</span>
                                    <span className="font-medium text-emerald-600">{new Date(invoice.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Billed To */}
                {invoice.clientName && (
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Billed To</p>
                        <p className="font-semibold text-slate-900">{invoice.clientName}</p>
                        {invoice.clientEmail && <p className="text-sm text-slate-600">{invoice.clientEmail}</p>}
                        {invoice.clientAddress && <p className="text-sm text-slate-600">{invoice.clientAddress}</p>}
                    </div>
                )}

                {/* Line Items */}
                <div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                                <th className="text-center py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">Qty</th>
                                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Rate</th>
                                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(invoice.items || []).map((item, i) => (
                                <tr key={i}>
                                    <td className="py-3 text-slate-800">{item.description}</td>
                                    <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                                    <td className="py-3 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                                    <td className="py-3 text-right font-medium text-slate-900">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="border-t border-slate-200 mt-4 pt-4">
                        <div className="max-w-xs ml-auto space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.taxRate > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">GST ({invoice.taxRate}%)</span>
                                    <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base border-t border-slate-200 pt-2 font-bold">
                                <span>Total ({invoice.currency || 'INR'})</span>
                                <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="border-t border-slate-100 pt-6">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notes & Terms</p>
                        <p className="text-sm text-slate-600">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
