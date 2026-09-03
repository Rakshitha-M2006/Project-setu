import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Select } from "../../components/ui/Select";
import { Alert } from "../../components/ui/Alert";
import { Department } from "../../types";
import {
  Send,
  MapPin,
  Bot,
  ArrowLeft,
} from "lucide-react";

export const NewGrievancePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [addressText, setAddressText] = useState("");
  const [pincode, setPincode] = useState("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await citizenApi.getDepartments();
        if (response.success && response.data) {
          setDepartments(response.data);
        }
      } catch (err: any) {
        toast.error("Failed to load departments catalog.", "Error");
      }
    };

    fetchDepartments();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg("Please provide a grievance title of at least 3 characters.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg("Please provide a detailed description of at least 10 characters.");
      return;
    }

    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      setErrorMsg("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await citizenApi.submitGrievance({
        title,
        description,
        departmentId: departmentId || undefined,
        addressText: addressText || undefined,
        pincode: pincode || undefined,
      });

      if (response.success && response.data) {
        const trackingNum = response.data.grievance.trackingNumber;
        toast.success(
          `Grievance submitted successfully! Tracking Number: ${trackingNum}`,
          "Case Registered"
        );
        navigate("/citizen/grievances", { replace: true });
      } else {
        setErrorMsg(response.message || "Failed to submit grievance. Please try again.");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Error submitting grievance.";
      setErrorMsg(message);
      toast.error(message, "Submission Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/citizen/grievances">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lodge Public Grievance
            </h1>
            <p className="text-xs text-slate-500">
              Submit your complaint directly to municipal and state government departments
            </p>
          </div>
        </div>
      </div>

      {/* 2. AI Notice Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-700 text-amber-400 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs leading-relaxed">
          <h4 className="font-bold text-sm text-white">Automated NLP Triage Active</h4>
          <p className="text-blue-200">
            Our AI engine will analyze your problem description, verify priority, assign the nodal officer,
            and establish a mandatory SLA turnaround deadline.
          </p>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="danger" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* 3. Grievance Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Grievance Details</CardTitle>
          <CardDescription>
            Provide accurate details to assist jurisdictional field officers in swift resolution
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Subject / Title of Grievance"
              required
              placeholder="e.g. Severe water pipeline leak near Main Market Ward 12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Select
              label="Target Department (Optional / AI Auto-Detect)"
              options={departmentOptions}
              placeholder="-- Auto-Detect via AI Engine --"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              helperText="Leave empty to allow SETU AI to classify and route the issue automatically"
            />

            <Textarea
              label="Detailed Problem Description"
              required
              rows={5}
              maxLength={2000}
              placeholder="Describe what occurred, exact location landmarks, duration of the issue, and urgency..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Incident Physical Address / Landmark"
                placeholder="e.g. Near Community Center, Sector 4"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <Input
                label="Incident Postal PIN Code"
                placeholder="e.g. 110001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link to="/citizen/grievances">
                <Button variant="outline" size="md">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="font-bold shadow-md px-6"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Submit Grievance
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewGrievancePage;
