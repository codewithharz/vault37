"use client";

import { Card, CardContent, CardHeader } from "../ui/Card";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "../ui/Badge";

import { useTranslations } from "next-intl";

export function SystemStatus() {
    const t = useTranslations("Status");
    const systems = [
        { name: t('apiGateway'), status: 'operational' },
        { name: t('databaseCluster'), status: 'operational' },
        { name: t('paymentProcessing'), status: 'degraded' }, // Mock data for demo
        { name: t('emailService'), status: 'operational' },
    ];

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">{t('systemStatus')}</h3>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {systems.map((sys) => (
                        <div key={sys.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {sys.status === 'operational' ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                                <span className="text-sm font-medium text-gray-700">{sys.name}</span>
                            </div>
                            <Badge variant={sys.status === 'operational' ? 'success' : 'warning'}>
                                {sys.status === 'operational' ? t('operational') : t('degraded')}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
