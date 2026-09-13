import React, { useState, useMemo, useEffect } from 'react';
import { ChefHat, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';
import { BillingStatement } from '../types';

interface Props {
  invoices: BillingStatement[];
  onUpdateInvoice: (updatedInvoice: BillingStatement) => void;
}

export function KitchenDisplayView({ invoices, onUpdateInvoice }: Props) {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Cooking' | 'Ready'>('Pending');

  // We assign a default status 'Pending' if kot_status is undefined
  const kots = useMemo(() => {
    return invoices
      .filter(i => (i.kot_status || 'Pending') !== 'Served') // hide served
      .map(i => ({ ...i, kot_status: i.kot_status || 'Pending' }))
      .sort((a, b) => new Date(a.bill_date).getTime() - new Date(b.bill_date).getTime());
  }, [invoices]);

  const displayedKots = kots.filter(k => k.kot_status === activeTab);

  const handleStatusChange = (invoice: BillingStatement, newStatus: 'Pending' | 'Cooking' | 'Ready' | 'Served') => {
    onUpdateInvoice({ ...invoice, kot_status: newStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-600" />
            Kitchen Display System (KDS)
          </h2>
          <p className="text-gray-500">Manage Kitchen Order Tickets (KOT) in real-time.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-200">
        {['Pending', 'Cooking', 'Ready'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === tab
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab} ({kots.filter(k => k.kot_status === tab).length})
          </button>
        ))}
      </div>

      {displayedKots.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No {activeTab.toLowerCase()} orders at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedKots.map(kot => (
            <div key={kot.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
              <div className={`px-4 py-3 border-b border-gray-100 flex justify-between items-center text-white ${
                kot.kot_status === 'Pending' ? 'bg-rose-500' :
                kot.kot_status === 'Cooking' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}>
                <div>
                  <div className="font-bold text-lg">{kot.invoice_number}</div>
                  <div className="text-xs opacity-90">{kot.order_type} {kot.table_number ? `- ${kot.table_number}` : ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{new Date(kot.bill_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              
              <div className="p-4 flex-1">
                <ul className="space-y-3">
                  {kot.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium text-gray-800">{item.item_name}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-sm font-bold">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                {kot.kot_status === 'Pending' && (
                  <button
                    onClick={() => handleStatusChange(kot, 'Cooking')}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> Start Cooking
                  </button>
                )}
                {kot.kot_status === 'Cooking' && (
                  <button
                    onClick={() => handleStatusChange(kot, 'Ready')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Ready
                  </button>
                )}
                {kot.kot_status === 'Ready' && (
                  <button
                    onClick={() => handleStatusChange(kot, 'Served')}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Served to Customer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
