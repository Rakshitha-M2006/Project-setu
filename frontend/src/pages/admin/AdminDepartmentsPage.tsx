import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import adminApi, { AdminDepartmentItem, AdminCategoryItem } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import {
  Building,
  Plus,
  RefreshCw,
  Clock,
  FolderTree,
} from "lucide-react";

export const AdminDepartmentsPage: React.FC = () => {
  const toast = useToast();
  const [departments, setDepartments] = useState<AdminDepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);
  const [deptForm, setDeptForm] = useState({
    code: "",
    name: "",
    description: "",
    nodalOfficerName: "",
    nodalOfficerEmail: "",
    nodalOfficerPhone: "",
    defaultSlaHours: 48,
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [selectedDept, setSelectedDept] = useState<AdminDepartmentItem | null>(null);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catForm, setCatForm] = useState({
    name: "",
    code: "",
    defaultPriority: "MEDIUM",
    defaultSlaHours: 48,
  });

  const loadDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.success && res.data) {
        setDepartments(res.data.departments as any);
      }
    } catch {
      toast.error("Failed to load departments.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.code || !deptForm.name) {
      toast.warning("Department code and name are required.", "Validation Error");
      return;
    }

    setIsSubmittingDept(true);
    try {
      const res = await adminApi.createDepartment(deptForm);
      if (res.success) {
        toast.success(`Department ${deptForm.name} registered.`, "Created");
        setIsDeptModalOpen(false);
        setDeptForm({
          code: "",
          name: "",
          description: "",
          nodalOfficerName: "",
          nodalOfficerEmail: "",
          nodalOfficerPhone: "",
          defaultSlaHours: 48,
        });
        loadDepartments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create department.", "Error");
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleOpenCategories = async (dept: AdminDepartmentItem) => {
    setSelectedDept(dept);
    setIsCategoryModalOpen(true);
    try {
      const res = await adminApi.getCategories({ departmentId: dept.id });
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch {
      toast.error("Failed to load grievance categories.", "Error");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !catForm.name) return;

    setIsSubmittingCat(true);
    try {
      const res = await adminApi.createCategory({
        departmentId: selectedDept.id,
        ...catForm,
      });
      if (res.success && res.data) {
        toast.success(`Category "${catForm.name}" created.`, "Success");
        setCategories((prev) => [...prev, res.data]);
        setCatForm({ name: "", code: "", defaultPriority: "MEDIUM", defaultSlaHours: 48 });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category.", "Error");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-700" />
            <span>Departments & Grievance Taxonomy</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure municipal departments, statutory SLAs, nodal officers, and category taxonomy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadDepartments}
            variant="outline"
            size="sm"
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            onClick={() => setIsDeptModalOpen(true)}
            size="sm"
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Department
          </Button>
        </div>
      </div>

      {/* 2. Departments Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Officers</TableHead>
                <TableHead>Grievances</TableHead>
                <TableHead>SLA Policy</TableHead>
                <TableHead className="text-right">Taxonomy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading departments..." description="Querying department master..." colSpan={6} />
              ) : departments.length === 0 ? (
                <EmptyTableState title="No departments found" description="Create a department to get started." colSpan={6} />
              ) : (
                departments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-bold text-xs text-purple-900">{d.code}</TableCell>
                    <TableCell className="font-bold text-xs text-slate-900">{d.name}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">{d._count?.officers ?? 0} Staff</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-blue-700">{d._count?.grievances ?? 0} Cases</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Clock className="w-3 h-3" />
                        {d.defaultSlaHours || 48}h SLA
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCategories(d)}
                        className="text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                        leftIcon={<FolderTree className="w-3.5 h-3.5" />}
                      >
                        Categories
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 3. Create Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Register New Municipal Department"
        description="Add a government department with statutory turnaround SLAs and nodal officer contacts."
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Department Code"
              placeholder="e.g. SANITATION"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              required
            />
            <Input
              label="Default SLA (Hours)"
              type="number"
              value={String(deptForm.defaultSlaHours)}
              onChange={(e) => setDeptForm({ ...deptForm, defaultSlaHours: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Department Full Name"
            placeholder="e.g. Department of Solid Waste & Public Sanitation"
            value={deptForm.name}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            required
          />

          <Input
            label="Nodal Officer Name"
            placeholder="e.g. Smt. Neha Sharma, IAS"
            value={deptForm.nodalOfficerName}
            onChange={(e) => setDeptForm({ ...deptForm, nodalOfficerName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nodal Officer Email"
              type="email"
              placeholder="nodal.officer@setu.gov.in"
              value={deptForm.nodalOfficerEmail}
              onChange={(e) => setDeptForm({ ...deptForm, nodalOfficerEmail: e.target.value })}
            />
            <Input
              label="Nodal Officer Phone"
              placeholder="011-23098877"
              value={deptForm.nodalOfficerPhone}
              onChange={(e) => setDeptForm({ ...deptForm, nodalOfficerPhone: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingDept} className="bg-purple-700 hover:bg-purple-800 text-white font-bold">
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Manage Categories Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={`Grievance Taxonomy — ${selectedDept?.name}`}
        description="Categories linked to this department for AI routing and citizen complaint filing."
      >
        <div className="space-y-4 pt-2">
          {/* Categories List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No categories defined yet for this department.</p>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="p-3 flex items-center justify-between text-xs bg-white">
                  <div>
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Code: {c.code || "N/A"} • Priority: {c.defaultPriority}</p>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {c.defaultSlaHours}h SLA
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleCreateCategory} className="space-y-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-900">Add New Category</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Category Name (e.g. Pipeline Leakage)"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
              />
              <Input
                placeholder="Category Code (e.g. PIP_LEAK)"
                value={catForm.code}
                onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={catForm.defaultPriority}
                onChange={(e) => setCatForm({ ...catForm, defaultPriority: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="LOW">LOW Priority</option>
                <option value="MEDIUM">MEDIUM Priority</option>
                <option value="HIGH">HIGH Priority</option>
                <option value="CRITICAL">CRITICAL Priority</option>
              </select>
              <Input
                type="number"
                placeholder="SLA Hours (e.g. 48)"
                value={String(catForm.defaultSlaHours)}
                onChange={(e) => setCatForm({ ...catForm, defaultSlaHours: Number(e.target.value) })}
              />
            </div>
            <Button type="submit" size="sm" isLoading={isSubmittingCat} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs">
              Add Category to Department
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDepartmentsPage;
