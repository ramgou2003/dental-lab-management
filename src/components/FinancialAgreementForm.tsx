import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { CustomCheckbox } from "@/components/CustomCheckbox";
import { SimpleCheckbox } from "@/components/SimpleCheckbox";
import { FileText, User, DollarSign, Shield, AlertTriangle, Scale, Edit, Clock } from "lucide-react";

interface FinancialAgreementFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
  initialData?: any; // database record for editing/preview
  isEditing?: boolean;
  readOnly?: boolean; // preview mode
}

export function FinancialAgreementForm({
  onSubmit,
  onCancel,
  patientName = "",
  patientDateOfBirth = "",
  initialData,
  isEditing = false,
  readOnly = false,
}: FinancialAgreementFormProps) {
  const [formData, setFormData] = useState({
    // Patient & Treatment Identification
    patientName: patientName,
    chartNumber: "",
    dateOfBirth: patientDateOfBirth || "",
    dateOfExecution: new Date().toISOString().split('T')[0],
    timeOfExecution: new Date().toTimeString().slice(0, 5),

    // Accepted Treatment
    acceptedTreatments: [] as Array<{service: string, fee: string, cdtCode: string, cptCode: string, initials: string}>,
    totalCostOfTreatment: "",

    // Payment & Balance Terms
    patientPaymentToday: "",
    remainingBalance: "",
    balanceDueDate: "",
    paymentTermsInitials: "",

    // Non-Refundable & Lab Fees
    labFeeInitials: "",

    // Warranty & Care Package
    carePackageFee: "",
    carePackageElection: "" as "enroll" | "defer" | "",
    warrantyInitials: "",

    // Capacity, Language & HIPAA
    capacityConfirmed: false,
    hipaaAcknowledged: false,
    capacityInitials: "",

    // Dispute Resolution
    disputeInitials: "",

    // Signatures
    termsAgreed: false,
    patientSignature: "",
    patientSignatureDate: new Date().toISOString().split('T')[0],
    patientSignatureTime: new Date().toTimeString().slice(0, 5),
    witnessName: "",
    witnessRole: "",
    witnessSignature: "",
    witnessSignatureDate: new Date().toISOString().split('T')[0],
    witnessSignatureTime: new Date().toTimeString().slice(0, 5),

    // Office Use Only
    scannedToChart: false,
    countersignedByManager: false,
  });

  // Treatment options with CDT and CPT codes
  const treatmentOptions = [
    { service: "Extraction(s)", cdtCode: "D7140", cptCode: "41899" },
    { service: "Bone Graft (GBR)", cdtCode: "D7953", cptCode: "21210" },
    { service: "Single Implant", cdtCode: "D6010", cptCode: "21248" },
    { service: "Multiple Implants", cdtCode: "D6012", cptCode: "21248" },
    { service: "Implant-Supported Denture (Lower)", cdtCode: "D6053", cptCode: "21299" },
    { service: "Implant-Supported Denture (Upper)", cdtCode: "D6054", cptCode: "21299" },
    { service: "Fixed Implant Bridge (Lower)", cdtCode: "D6055", cptCode: "21299" },
    { service: "Fixed Implant Bridge (Upper)", cdtCode: "D6056", cptCode: "21299" },
  ];

  // Auto-sync patient data when it changes
  useEffect(() => {
    const updates: any = {};

    if (patientName && patientName !== formData.patientName) {
      updates.patientName = patientName;
    }

    if (patientDateOfBirth && patientDateOfBirth !== formData.dateOfBirth) {
      updates.dateOfBirth = patientDateOfBirth;
    }

    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [patientName, patientDateOfBirth, formData.patientName, formData.dateOfBirth]);

  // Prefill when initial data is provided (edit or preview)
  useEffect(() => {
    if (!initialData) return;

    // Map database fields to form fields
    setFormData(prev => ({
      ...prev,
      patientName: initialData.patient_name || prev.patientName,
      chartNumber: initialData.chart_number || "",
      dateOfBirth: initialData.date_of_birth || "",
      dateOfExecution: initialData.date_of_execution || prev.dateOfExecution,
      timeOfExecution: initialData.time_of_execution || prev.timeOfExecution,

      acceptedTreatments: Array.isArray(initialData.accepted_treatments) ? initialData.accepted_treatments.map((t: any) => ({
        service: t.service || "",
        fee: t.fee?.toString?.() || (typeof t.fee === 'number' ? String(t.fee.toFixed?.(2) ?? t.fee) : (t.fee || "")),
        cdtCode: t.cdtCode || "",
        cptCode: t.cptCode || "",
        initials: t.initials || "",
      })) : [],
      totalCostOfTreatment: initialData.total_cost_of_treatment != null ? String(initialData.total_cost_of_treatment) : "",

      patientPaymentToday: initialData.patient_payment_today != null ? String(initialData.patient_payment_today) : "",
      remainingBalance: initialData.remaining_balance != null ? String(initialData.remaining_balance) : "",
      balanceDueDate: initialData.balance_due_date || "",
      paymentTermsInitials: initialData.payment_terms_initials || "",

      labFeeInitials: initialData.lab_fee_initials || "",

      carePackageFee: initialData.care_package_fee != null ? String(initialData.care_package_fee) : "",
      carePackageElection: (initialData.care_package_election || "") as any,
      warrantyInitials: initialData.warranty_initials || "",

      capacityConfirmed: !!initialData.capacity_confirmed,
      hipaaAcknowledged: !!initialData.hipaa_acknowledged,
      capacityInitials: initialData.capacity_initials || "",

      disputeInitials: initialData.dispute_initials || "",

      termsAgreed: !!initialData.terms_agreed,
      patientSignature: initialData.patient_signature || "",
      patientSignatureDate: initialData.patient_signature_date || prev.patientSignatureDate,
      patientSignatureTime: initialData.patient_signature_time || prev.patientSignatureTime,
      witnessName: initialData.witness_name || "",
      witnessRole: initialData.witness_role || "",
      witnessSignature: initialData.witness_signature || "",
      witnessSignatureDate: initialData.witness_signature_date || prev.witnessSignatureDate,
      witnessSignatureTime: initialData.witness_signature_time || prev.witnessSignatureTime,

      scannedToChart: !!initialData.scanned_to_chart,
      countersignedByManager: !!initialData.countersigned_by_manager,
    }));
  }, [isEditing, initialData]);

  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);
  const [showWitnessSignatureDialog, setShowWitnessSignatureDialog] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value };

      // Calculate remaining balance when patient payment or total cost changes
      if (field === 'patientPaymentToday' || field === 'totalCostOfTreatment') {
        const totalCost = parseFloat(updatedData.totalCostOfTreatment) || 0;
        const patientPayment = parseFloat(updatedData.patientPaymentToday) || 0;
        const remainingBalance = Math.max(0, totalCost - patientPayment);
        updatedData.remainingBalance = remainingBalance.toFixed(2);
      }

      return updatedData;
    });
  };

  const handleTreatmentChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedTreatments = prev.acceptedTreatments.map((treatment, i) =>
        i === index ? { ...treatment, [field]: value } : treatment
      );

      let updatedData = {
        ...prev,
        acceptedTreatments: updatedTreatments
      };

      // Calculate total cost when fee changes
      if (field === 'fee') {
        const totalCost = updatedTreatments
          .reduce((sum, treatment) => {
            const fee = parseFloat(treatment.fee) || 0;
            return sum + fee;
          }, 0)
          .toFixed(2);

        updatedData.totalCostOfTreatment = totalCost;

        // Also recalculate remaining balance
        const patientPayment = parseFloat(updatedData.patientPaymentToday) || 0;
        const remainingBalance = Math.max(0, parseFloat(totalCost) - patientPayment);
        updatedData.remainingBalance = remainingBalance.toFixed(2);
      }

      return updatedData;
    });
  };

  const addTreatment = (service: string, cdtCode: string, cptCode: string) => {
    setFormData(prev => ({
      ...prev,
      acceptedTreatments: [...prev.acceptedTreatments, { service, fee: "", cdtCode, cptCode, initials: "" }]
    }));
  };

  const removeTreatment = (index: number) => {
    setFormData(prev => {
      const updatedTreatments = prev.acceptedTreatments.filter((_, i) => i !== index);

      // Recalculate total cost after removal
      const totalCost = updatedTreatments
        .reduce((sum, treatment) => {
          const fee = parseFloat(treatment.fee) || 0;
          return sum + fee;
        }, 0)
        .toFixed(2);

      // Recalculate remaining balance
      const patientPayment = parseFloat(prev.patientPaymentToday) || 0;
      const remainingBalance = Math.max(0, parseFloat(totalCost) - patientPayment);

      return {
        ...prev,
        acceptedTreatments: updatedTreatments,
        totalCostOfTreatment: totalCost,
        remainingBalance: remainingBalance.toFixed(2)
      };
    });
  };

  const handlePatientSignatureSave = (signatureData: string) => {
    setFormData(prev => ({ ...prev, patientSignature: signatureData }));
    setShowPatientSignatureDialog(false);
  };

  const handleWitnessSignatureSave = (signatureData: string) => {
    setFormData(prev => ({ ...prev, witnessSignature: signatureData }));
    setShowWitnessSignatureDialog(false);
  };

  const handlePatientSignatureClear = () => {
    setFormData(prev => ({ ...prev, patientSignature: "" }));
  };

  const handleWitnessSignatureClear = () => {
    setFormData(prev => ({ ...prev, witnessSignature: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) {
      onCancel();
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Financial Agreement & Payment Terms
        </DialogTitle>
        <p className="text-sm text-gray-600 mt-2">Form Version 1.0 – Effective 07/2025 | Page 1 of 2</p>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Patient & Treatment Identification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <User className="h-5 w-5" />
              1. Patient & Treatment Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="patientName" className="text-sm font-semibold">
                  <span className="text-red-500">*</span> Patient Name
                </Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  readOnly
                  className="mt-1 bg-gray-50 cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <Label htmlFor="chartNumber">Chart #</Label>
                <Input
                  id="chartNumber"
                  value={formData.chartNumber}
                  onChange={(e) => handleInputChange('chartNumber', e.target.value)}
                  placeholder="Chart number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                  readOnly={!!patientDateOfBirth}
                  className={patientDateOfBirth ? "bg-gray-50 cursor-not-allowed" : ""}
                />
              </div>
              <div>
                <Label htmlFor="dateOfExecution">Date of Execution</Label>
                <Input
                  id="dateOfExecution"
                  type="date"
                  value={formData.dateOfExecution}
                  onChange={(e) => handleInputChange('dateOfExecution', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="timeOfExecution">Time</Label>
                <div className="relative">
                  <Input
                    id="timeOfExecution"
                    type="time"
                    value={formData.timeOfExecution}
                    onChange={(e) => handleInputChange('timeOfExecution', e.target.value)}
                    required
                    className="pr-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
                      handleInputChange('timeOfExecution', currentTime);
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 flex items-center gap-1 border border-blue-300 bg-white hover:bg-blue-50 text-blue-600 text-xs rounded-md"
                    title="Set current time"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Current Time
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accepted Treatment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <DollarSign className="h-5 w-5" />
              Accepted Treatment (patient to initial each selected)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Treatment Selection */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Add Treatment:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {treatmentOptions.map((option) => (
                  <Button
                    key={option.service}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTreatment(option.service, option.cdtCode, option.cptCode)}
                    className="text-xs h-auto py-2 px-3 text-left justify-start whitespace-normal flex flex-col items-start gap-1"
                  >
                    <span className="font-medium">+ {option.service}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-blue-600 font-mono opacity-75">CDT: {option.cdtCode}</span>
                      <span className="text-green-600 font-mono opacity-75">CPT: {option.cptCode}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Treatments Table */}
            {formData.acceptedTreatments.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700">
                    <div className="col-span-3">Service</div>
                    <div className="col-span-2">Fee (USD)</div>
                    <div className="col-span-3">Codes</div>
                    <div className="col-span-2">Initials</div>
                    <div className="col-span-2">Action</div>
                  </div>
                </div>
                <div className="divide-y">
                  {formData.acceptedTreatments.map((treatment, index) => (
                    <div key={index} className="px-4 py-3">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3 text-sm font-medium">{treatment.service}</div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={treatment.fee}
                            onChange={(e) => handleTreatmentChange(index, 'fee', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-3 text-xs text-gray-600">
                          <div className="flex flex-col gap-1">
                            <span className="text-blue-600 font-mono">CDT: {treatment.cdtCode}</span>
                            <span className="text-green-600 font-mono">CPT: {treatment.cptCode}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Input
                            placeholder="___"
                            value={treatment.initials}
                            onChange={(e) => handleTreatmentChange(index, 'initials', e.target.value)}
                            className="text-sm text-center"
                            maxLength={3}
                          />
                        </div>
                        <div className="col-span-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTreatment(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Label htmlFor="totalCostOfTreatment" className="text-base font-semibold flex items-center gap-2">
                Total Cost of Treatment
                <span className="text-xs text-gray-500 font-normal">(Auto-calculated)</span>
              </Label>
              <Input
                id="totalCostOfTreatment"
                type="text"
                value={formData.totalCostOfTreatment ? `$${formData.totalCostOfTreatment}` : '$0.00'}
                readOnly
                className="mt-1 text-lg font-medium bg-green-50 border-green-200 text-green-800 cursor-not-allowed"
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Payment & Balance Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <DollarSign className="h-5 w-5" />
              2. Payment & Balance Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientPaymentToday" className="text-sm font-semibold">Patient Payment Today</Label>
                <Input
                  id="patientPaymentToday"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.patientPaymentToday}
                  onChange={(e) => handleInputChange('patientPaymentToday', e.target.value)}
                  readOnly={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="remainingBalance" className="text-sm font-semibold flex items-center gap-2">
                  Remaining Balance
                  <span className="text-xs text-gray-500 font-normal">(Auto-calculated)</span>
                </Label>
                <Input
                  id="remainingBalance"
                  type="text"
                  value={formData.remainingBalance ? `$${formData.remainingBalance}` : '$0.00'}
                  readOnly
                  className="bg-blue-50 border-blue-200 text-blue-800 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Balance Due Date</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Terms Dropdown */}
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Payment terms:</Label>
                  <Select
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        // Don't change the date, just allow custom input
                        return;
                      }
                      const days = parseInt(value);
                      const dueDate = new Date();
                      dueDate.setDate(dueDate.getDate() + days);
                      handleInputChange('balanceDueDate', dueDate.toISOString().split('T')[0]);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose terms..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Net 15 Days</SelectItem>
                      <SelectItem value="30">1 Month (30 days)</SelectItem>
                      <SelectItem value="90">3 Months (90 days)</SelectItem>
                      <SelectItem value="180">6 Months (180 days)</SelectItem>
                      <SelectItem value="custom">Custom Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date Input */}
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Due date:</Label>
                  <Input
                    id="balanceDueDate"
                    type="date"
                    value={formData.balanceDueDate}
                    onChange={(e) => handleInputChange('balanceDueDate', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Late Payment Penalty:</strong> A $100 will be charged on any unpaid balance.</p>
                <p><strong>Credit Reporting:</strong> I authorize referral of any unpaid balance to collections and credit bureaus if I default.</p>
              </div>
              <div className="flex justify-end mt-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="paymentTermsInitials" className="text-sm whitespace-nowrap">Patient initials:</Label>
                  <Input
                    id="paymentTermsInitials"
                    placeholder="___"
                    value={formData.paymentTermsInitials}
                    onChange={(e) => handleInputChange('paymentTermsInitials', e.target.value)}
                    className="w-16 text-center"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Non-Refundable & Lab Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <AlertTriangle className="h-5 w-5" />
              3. Non-Refundable & Lab Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-3">
                <p className="text-sm text-blue-800">
                  <strong>All payments</strong> made under this Agreement for listed services are <strong>non-refundable</strong>, even if I discontinue treatment.
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Lab Fee:</strong> A <strong>$10,000 (ten thousand dollars)</strong> non-refundable lab advance is charged once records are submitted. I acknowledge this fee was discussed and consented to today.
                </p>
              </div>
              <div className="flex justify-end mt-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="labFeeInitials" className="text-sm whitespace-nowrap">Patient initials:</Label>
                  <Input
                    id="labFeeInitials"
                    placeholder="___"
                    value={formData.labFeeInitials}
                    onChange={(e) => handleInputChange('labFeeInitials', e.target.value)}
                    className="w-16 text-center"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Warranty & Care Package Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Shield className="h-5 w-5" />
              4. Warranty & Care Package Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                <strong>3-Year "Peace of Mind" Guarantee</strong> covers <strong>materials & workmanship</strong> only if BOTH conditions are met:
              </p>
              <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1 mb-3">
                <li>Attend scheduled follow-up visits every 6 months.</li>
                <li>Enroll in the Post-Surgery Care Package at $ <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.carePackageFee}
                  onChange={(e) => handleInputChange('carePackageFee', e.target.value)}
                  className="inline-block w-24 h-6 text-xs mx-1"
                /> dollars.</li>
              </ol>

              <div className="space-y-3">
                <SimpleCheckbox
                  id="enroll"
                  checked={formData.carePackageElection === 'enroll'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleInputChange('carePackageElection', 'enroll');
                    }
                  }}
                >
                  I elect <strong>to enroll</strong> in the Care Package and understand its terms.
                </SimpleCheckbox>

                <SimpleCheckbox
                  id="defer"
                  checked={formData.carePackageElection === 'defer'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleInputChange('carePackageElection', 'defer');
                    }
                  }}
                >
                  I elect <strong>to defer</strong> enrollment, and agree to pay for any complications within 3 years and thereafter.
                </SimpleCheckbox>
              </div>

              <div className="flex justify-end mt-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="warrantyInitials" className="text-sm whitespace-nowrap">Patient initials:</Label>
                  <Input
                    id="warrantyInitials"
                    placeholder="___"
                    value={formData.warrantyInitials}
                    onChange={(e) => handleInputChange('warrantyInitials', e.target.value)}
                    className="w-16 text-center"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Capacity, Language & HIPAA Acknowledgment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <User className="h-5 w-5" />
              5. Capacity, Language & HIPAA Acknowledgment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-3">
                <CustomCheckbox
                  id="capacityConfirmed"
                  checked={formData.capacityConfirmed}
                  onCheckedChange={(checked) => handleInputChange('capacityConfirmed', checked as boolean)}
                >
                  I confirm I am ≥ 18 years old, of sound mind, and fluent in English (or declined an interpreter).
                </CustomCheckbox>

                <CustomCheckbox
                  id="hipaaAcknowledged"
                  checked={formData.hipaaAcknowledged}
                  onCheckedChange={(checked) => handleInputChange('hipaaAcknowledged', checked as boolean)}
                >
                  I acknowledge receipt of the Notice of Privacy Practices and consent to communication of billing information via unencrypted email/SMS.
                </CustomCheckbox>
              </div>

              <div className="flex justify-end mt-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="capacityInitials" className="text-sm whitespace-nowrap">Patient initials:</Label>
                  <Input
                    id="capacityInitials"
                    placeholder="___"
                    value={formData.capacityInitials}
                    onChange={(e) => handleInputChange('capacityInitials', e.target.value)}
                    className="w-16 text-center"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Dispute Resolution & Legal Provisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Scale className="h-5 w-5" />
              6. Dispute Resolution & Legal Provisions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <strong>1. Governing Law & Venue:</strong> This Agreement is governed by New York Law. Any dispute shall be resolved by <strong>binding arbitration</strong> in Monroe County, NY under AAA rules.
                </div>
                <div>
                  <strong>2. Amendments:</strong> No modification is effective unless in writing and signed by both parties.
                </div>
                <div>
                  <strong>3. Severability:</strong> If any provision is deemed invalid, the remainder shall remain in full force.
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="disputeInitials" className="text-sm whitespace-nowrap">Patient initials:</Label>
                  <Input
                    id="disputeInitials"
                    placeholder="___"
                    value={formData.disputeInitials}
                    onChange={(e) => handleInputChange('disputeInitials', e.target.value)}
                    className="w-16 text-center"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. Signatures & Witness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Edit className="h-5 w-5" />
              7. Signatures & Witness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mb-4">
              <SimpleCheckbox
                id="termsAgreed"
                checked={formData.termsAgreed}
                onCheckedChange={(checked) => handleInputChange('termsAgreed', checked)}
              >
                I have read, understood, and agreed to all terms above.
              </SimpleCheckbox>
            </div>

            {/* Patient Signature Section */}
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Patient Full Name (print)</Label>
                  <Input
                    value={formData.patientName}
                    readOnly
                    className="mt-1 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Date/Time</Label>
                  <div className="space-y-2 mt-1">
                    <Input
                      type="date"
                      value={formData.patientSignatureDate}
                      onChange={(e) => handleInputChange('patientSignatureDate', e.target.value)}
                    />
                    <div className="relative">
                      <Input
                        type="time"
                        value={formData.patientSignatureTime}
                        onChange={(e) => handleInputChange('patientSignatureTime', e.target.value)}
                        className="pr-32"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                          const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
                          handleInputChange('patientSignatureDate', currentDate);
                          handleInputChange('patientSignatureTime', currentTime);
                        }}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 px-1 flex items-center gap-1 border border-blue-300 bg-white hover:bg-blue-50 text-blue-600 text-xs rounded-md"
                        title="Set current date and time"
                      >
                        <Clock className="h-3 w-3" />
                        Current Date & Time
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    {formData.patientSignature ? (
                      <SignaturePreview
                        signature={formData.patientSignature}
                        onEdit={() => setShowPatientSignatureDialog(true)}
                        onClear={handlePatientSignatureClear}
                        label="Patient Signature"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPatientSignatureDialog(true)}
                        className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Witness Signature Section */}
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Staff Witness Name & Role</Label>
                  <div className="space-y-2 mt-1">
                    <Input
                      placeholder="Witness name"
                      value={formData.witnessName}
                      onChange={(e) => handleInputChange('witnessName', e.target.value)}
                    />
                    <Input
                      placeholder="Role/Title"
                      value={formData.witnessRole}
                      onChange={(e) => handleInputChange('witnessRole', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date/Time</Label>
                  <div className="space-y-2 mt-1">
                    <Input
                      type="date"
                      value={formData.witnessSignatureDate}
                      onChange={(e) => handleInputChange('witnessSignatureDate', e.target.value)}
                    />
                    <div className="relative">
                      <Input
                        type="time"
                        value={formData.witnessSignatureTime}
                        onChange={(e) => handleInputChange('witnessSignatureTime', e.target.value)}
                        className="pr-32"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                          const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
                          handleInputChange('witnessSignatureDate', currentDate);
                          handleInputChange('witnessSignatureTime', currentTime);
                        }}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 px-1 flex items-center gap-1 border border-blue-300 bg-white hover:bg-blue-50 text-blue-600 text-xs rounded-md"
                        title="Set current date and time"
                      >
                        <Clock className="h-3 w-3" />
                        Current Date & Time
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    {formData.witnessSignature ? (
                      <SignaturePreview
                        signature={formData.witnessSignature}
                        onEdit={() => setShowWitnessSignatureDialog(true)}
                        onClear={handleWitnessSignatureClear}
                        label="Witness Signature"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowWitnessSignatureDialog(true)}
                        className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Use Only */}
        <Card>
          <CardContent className="pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Office Use Only:</h4>
              <div className="space-y-2">
                <SimpleCheckbox
                  id="scannedToChart"
                  checked={formData.scannedToChart || false}
                  onCheckedChange={(checked) => handleInputChange('scannedToChart', checked)}
                >
                  Scanned to chart
                </SimpleCheckbox>
                <SimpleCheckbox
                  id="countersignedByManager"
                  checked={formData.countersignedByManager || false}
                  onCheckedChange={(checked) => handleInputChange('countersignedByManager', checked)}
                >
                  Countersigned by Finance Manager
                </SimpleCheckbox>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? 'Update Financial Agreement' : 'Save Financial Agreement'}
            </Button>
          )}
        </div>
      </form>

      {/* Signature Dialogs */}
      <SignatureDialog
        isOpen={showPatientSignatureDialog}
        onClose={() => setShowPatientSignatureDialog(false)}
        onSave={handlePatientSignatureSave}
        title="Patient Signature"
        currentSignature={formData.patientSignature}
      />

      <SignatureDialog
        isOpen={showWitnessSignatureDialog}
        onClose={() => setShowWitnessSignatureDialog(false)}
        onSave={handleWitnessSignatureSave}
        title="Witness Signature"
        currentSignature={formData.witnessSignature}
      />
    </div>
  );
}
