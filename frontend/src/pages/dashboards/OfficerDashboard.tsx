import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, EmptyTableState } from "../../components/ui/Table";
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* 1. Officer Status Header */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-400/20 font-medium">
              Field Officer Workbench
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Officer Queue • {user?.officerProfile?.department?.name || "General Administration"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Jurisdiction Ward: <strong>{user?.officerProfile?.jurisdictionWard || "Ward 12 - Central Zone"}</strong>.
            Please review assigned grievances, inspect field locations, and resolve within target SLA windows.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <span className="bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-slate-200">
            Active Load: <strong className="text-amber-400">0 cases</strong>
          </span>
        </div>
      </div>

      {/* 2. Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Queue</p>
              <p className="text-2xl font-black text-slate-900 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical / Urgent</p>
              <p className="text-2xl font-black text-rose-600 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Under Inspection</p>
              <p className="text-2xl font-black text-amber-600 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Cases</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Assigned Complaints Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Assigned Grievances Workbench</CardTitle>
            <CardDescription>Departmental grievances assigned to your jurisdiction for investigation & resolution</CardDescription>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-3.5 h-3.5" />}>
            Filter Tasks
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Citizen / Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>SLA Target</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <EmptyTableState
                title="Officer queue is clear"
                description="No unassigned or pending grievances are currently waiting in your queue."
                colSpan={6}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerDashboard;
