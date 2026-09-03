import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, EmptyTableState } from "../../components/ui/Table";
import {
  TrendingUp,
  AlertOctagon,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";

export const SeniorOfficerDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* 1. Senior Executive Header */}
      <div className="bg-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full border border-indigo-400/20 font-medium">
              Head of Department (HOD) Oversight
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Department Escalation & SLA Command Center
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
            Real-time monitoring of department grievance throughput, automated Level-1/2 escalations,
            field officer turnaround times, and citizen satisfaction ratings.
          </p>
        </div>

        <div className="shrink-0 flex gap-3">
          <Link to="/senior-officer/escalations">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-md" leftIcon={<AlertOctagon className="w-4 h-4" />}>
              View Escalations
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Executive Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dept Grievances</p>
              <p className="text-2xl font-black text-slate-900 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Escalations</p>
              <p className="text-2xl font-black text-rose-600 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field Officers</p>
              <p className="text-2xl font-black text-blue-600 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA Adherence</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">100%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. SLA Escalations Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Pending Escalations</CardTitle>
            <CardDescription>Grievances requiring executive intervention due to SLA breach or citizen appeal</CardDescription>
          </div>
          <Link to="/senior-officer/escalations">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Full Monitor
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escalation ID</TableHead>
                <TableHead>Grievance</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Overdue Duration</TableHead>
                <TableHead>Assigned Officer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <EmptyTableState
                title="Zero active escalations"
                description="All departmental grievances are progressing within stipulated SLA timelines."
                colSpan={6}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeniorOfficerDashboard;
