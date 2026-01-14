
import React from 'react';
import { ShieldCheck, Lock, Landmark, Zap, Scale } from "lucide-react";

export function AssetProtections() {
    const protections = [
        { icon: ShieldCheck, text: "Insurance Coverage Certificate" },
        { icon: Landmark, text: "Physical Commodity Backing" },
        { icon: Lock, text: "100% Capital Preservation" },
        { icon: Zap, text: "Cluster Node Assignment" },
        { icon: Scale, text: "Automated Scale Compounding" }
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Asset Protections
            </h3>
            <ul className="space-y-5">
                {protections.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{item.text}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    All TPIA classifications are strictly regulated and secured by physical reserves, ensuring maximum stability for your digital portfolio.
                </p>
            </div>
        </div>
    );
}
