"use client";

import { useState } from "react";
import { Plus, Trash2, Building } from "lucide-react";

export function BankAccountsManager() {
    const [accounts, setAccounts] = useState([
        { id: 1, bankName: "gtbank", accountName: "John Doe", accountNumber: "012****789", isDefault: true },
        { id: 2, bankName: "access", accountName: "John Doe", accountNumber: "003****441", isDefault: false },
    ]);
    const [showForm, setShowForm] = useState(false);

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to remove this account?")) {
            setAccounts(accounts.filter(a => a.id !== id));
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Connected Accounts</h4>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-sm text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add New
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {accounts.map((account) => (
                    <div key={account.id} className="p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-amber-200 transition-colors bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                <Building className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    {account.bankName.toUpperCase()}
                                    {account.isDefault && (
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Default</span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500">{account.accountNumber} • {account.accountName}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(account.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {showForm ? (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        <input type="text" placeholder="Bank Name" className="w-full p-2 border rounded-lg text-sm outline-none focus:border-amber-500" />
                        <input type="text" placeholder="Account Number" className="w-full p-2 border rounded-lg text-sm outline-none focus:border-amber-500" />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-3 py-1 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                            >
                                Add Account
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Connect Bank Account
                    </button>
                )}
            </div>
        </div>
    );
}
