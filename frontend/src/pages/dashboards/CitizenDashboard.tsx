import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, EmptyTableState } from "../../components/ui/Table";
import {
  FilePlus,
  Clock,
  CheckCircle2,
  Briefcase,
  ArrowRight,
} from "lucide-react";

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/30 text-blue-200 text-xs px-2.5 py-0.5 rounded-full border border-blue-400/30 font-medium">
              Citizen Portal • SIH 2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Namaste, {user?.fullName} 🙏
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl">
            Welcome to your citizen redressal dashboard. All submitted grievances are automatically triaged
            by the AI engine and routed to jurisdictional authorities with SLA guarantees.
          </p>
        </div>

        <div className="shrink-0 flex gap-3">
          <Link to="/citizen/grievances/new">
            <Button className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md" leftIcon={<FilePlus className="w-4 h-4" />}>
              Lodge Grievance
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Grievance Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Lodged</p>
              <p className="text-2xl font-black text-slate-900 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <FilePlus className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Services Active</p>
              <p className="text-2xl font-black text-purple-600 font-mono">0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Grievances Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Grievances</CardTitle>
            <CardDescription>Live tracking status of complaints submitted under your citizen profile</CardDescription>
          </div>
          <Link to="/citizen/grievances">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <EmptyTableState
                title="No grievances lodged yet"
                description="Click 'Lodge Grievance' above to report an issue to municipal authorities."
                colSpan={5}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenDashboard;
