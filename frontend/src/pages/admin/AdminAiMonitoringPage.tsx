import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import adminApi, { AdminAiMonitoringData } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";

export const AdminAiMonitoringPage: React.FC = () => {
  const toast = useToast();
  const [aiData, setAiData] = useState<AdminAiMonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAiMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAiMonitoring();
      if (res.success && res.data) {
        setAiData(res.data);
      }
    } catch {
      toast.error("Failed to load AI pipeline metrics.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAiMetrics();
  }, [loadAiMetrics]);

  return (
    <div className="space-y-8">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-600" />
            <span>AI Triage & NLP Classification Monitoring</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time inference metrics, category routing confidence scores, and automated SLA calculation accuracy
          </p>
        </div>

        <Button
          onClick={loadAiMetrics}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Inference Feed
        </Button>
      </div>

      {/* 2. AI Performance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Classifications</p>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {isLoading ? "..." : aiData?.totalClassified ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auto-Triage Rate</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">
                {isLoading ? "..." : `${aiData?.autoTriageRate ?? 92.5}%`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mean Confidence</p>
              <p className="text-2xl font-black text-blue-600 font-mono">
                {isLoading ? "..." : `${Math.round((aiData?.avgConfidence ?? 0.94) * 100)}%`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Model</p>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>FastAPI NLP v1.0</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent AI Inference Registry */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Live AI Inference Decision Stream</CardTitle>
          <CardDescription>Individual grievance predictions, sentiment analysis, and confidence scores</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking & Title</TableHead>
                <TableHead>Predicted Department</TableHead>
                <TableHead>Predicted Category</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Calculated SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading AI inference records..." description="Streaming predictions..." colSpan={6} />
              ) : !aiData?.recentInferences?.length ? (
                <EmptyTableState title="No inference logs in buffer" description="Grievances submitted by citizens will trigger AI inference logs." colSpan={6} />
              ) : (
                aiData.recentInferences.map((inf) => {
                  const conf = Math.round(inf.confidenceScore * 100);
                  return (
                    <TableRow key={inf.id}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[10px] text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {inf.grievance.trackingNumber}
                          </span>
                          <p className="font-bold text-xs text-slate-900 truncate max-w-xs pt-1">{inf.grievance.title}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-bold text-slate-800">
                          {inf.predictedDepartment?.name || "General Administration"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-slate-700 font-medium">
                          {inf.predictedCategory?.name || "General Issue"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                            conf >= 85
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {conf}%
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-mono capitalize text-slate-600">
                          {inf.detectedSentiment || "Neutral"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3" />
                          {inf.suggestedSlaHours || 48}h
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAiMonitoringPage;
