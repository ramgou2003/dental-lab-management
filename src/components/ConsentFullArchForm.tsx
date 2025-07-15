import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { FileText, User, Calendar, AlertTriangle, Stethoscope, Pill, CheckCircle, Edit } from "lucide-react";

interface ConsentFullArchFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
}

export function ConsentFullArchForm({ onSubmit, onCancel, patientName = "" }: ConsentFullArchFormProps) {
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: patientName,
    date: new Date().toISOString().split('T')[0],

    // Treatment Plan Selections (only checkboxes we keep)
    treatmentPlan: [] as string[],

    // Post-operative Instructions Acknowledgment
    postOpInstructionsAcknowledged: false,

    // Signatures
    patientSignature: "", // Will store base64 image data
    patientSignatureDate: new Date().toISOString().split('T')[0],
    witnessName: "",
    witnessSignature: "", // Will store base64 image data
    witnessSignatureDate: new Date().toISOString().split('T')[0]
  });

  // Auto-sync patient name when it changes
  useEffect(() => {
    if (patientName && patientName !== formData.patientName) {
      setFormData(prev => ({ ...prev, patientName: patientName }));
    }
  }, [patientName, formData.patientName]);

  // Auto-sync patient name when it changes
  useEffect(() => {
    if (patientName && patientName !== formData.patientName) {
      setFormData(prev => ({ ...prev, patientName: patientName }));
    }
  }, [patientName, formData.patientName]);

  // Signature dialog states
  const [patientSignatureDialogOpen, setPatientSignatureDialogOpen] = useState(false);
  const [witnessSignatureDialogOpen, setWitnessSignatureDialogOpen] = useState(false);

  const treatmentOptions = [
    "Implant Supported Denture (Lower)",
    "Implant Supported Denture (Upper)",
    "Implant Supported Denture (Dual Arch)",
    "Surgical Revision",
    "Denture (Upper)",
    "Fixed Implant Nano-ceramic Bridge (Dual Arch)",
    "Multiple Implants",
    "Extraction(s)",
    "Fixed Implant Nano-ceramic Bridge (Lower)",
    "Single Implant",
    "Wisdom Teeth Extraction",
    "Fixed Implant Nano-ceramic Bridge (Upper)",
    "Extractions and Implant Placement",
    "Denture (Lower)",
    "Fixed Implant Zirconia Bridge (Lower)",
    "Fixed Implant Zirconia Bridge (Dual Arch)",
    "Fixed Implant Zirconia Bridge (Upper)"
  ];

  const handleTreatmentPlanChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      treatmentPlan: checked
        ? [...prev.treatmentPlan, option]
        : prev.treatmentPlan.filter(item => item !== option)
    }));
  };

  // Signature handlers
  const handlePatientSignatureSave = (signature: string) => {
    setFormData(prev => ({ ...prev, patientSignature: signature }));
  };

  const handleWitnessSignatureSave = (signature: string) => {
    setFormData(prev => ({ ...prev, witnessSignature: signature }));
  };

  const handlePatientSignatureClear = () => {
    setFormData(prev => ({ ...prev, patientSignature: "" }));
  };

  const handleWitnessSignatureClear = () => {
    setFormData(prev => ({ ...prev, witnessSignature: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['patientName', 'patientSignatureDate', 'witnessName', 'witnessSignatureDate'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    // Check if signatures are drawn
    if (!formData.patientSignature) {
      missingFields.push('Patient Signature (please draw your signature)');
    }
    if (!formData.witnessSignature) {
      missingFields.push('Witness Signature (please draw witness signature)');
    }

    if (missingFields.length > 0) {
      alert(`Please complete all required fields: ${missingFields.join(', ')}`);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Consent Packet for Full Arch Surgery
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
              <Label htmlFor="date" className="text-sm font-semibold">
                <span className="text-red-500">*</span> Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Treatment Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-green-600" />
              Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {treatmentOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleTreatmentPlanChange(option, !formData.treatmentPlan.includes(option))}
                  className={`
                    relative p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md
                    ${formData.treatmentPlan.includes(option)
                      ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium pr-2">{option}</span>
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${formData.treatmentPlan.includes(option)
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                      }
                    `}>
                      {formData.treatmentPlan.includes(option) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pre-Operative Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Pre-Operative Instructions for Full Arch Surgery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                If you have any questions or concerns about your surgery, please contact our office at (585) 394-5910 or by email at contact@nysdentalimplants.com
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <p>We will be reviewing your medical history with you prior to your surgery. Please let us know if there has been any change in your history since we last met.</p>

              <p>Brush your teeth before you come in. If you use mouthwash, do not swallow it.</p>

              <p>Unless specified by our office, do not discontinue any medicines prescribed by your other health providers.</p>

              <p>No fluid or food ingestion 8 hrs. prior if you are scheduled for IV sedation (please see below).</p>
            </div>
          </CardContent>
        </Card>

        {/* IV Sedation Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-indigo-600" />
              I.V. (INTRAVENOUS) CONSCIOUS SEDATION INSTRUCTIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <p><strong>1.</strong> To reduce the chance of complications, do not eat or drink anything (including water) for at least <strong>EIGHT</strong> hours prior to your Appointment.</p>

              <p><strong>2.</strong> If your surgery is in the morning, do not eat or drink anything between bedtime and your scheduled appointment.</p>

              <p><strong>3.</strong> If your surgery is in the afternoon, a light breakfast before 7:00 am is encouraged.</p>

              <p><strong>4.</strong> A responsible adult, 18 years or older, should accompany you to the office and remain in the office during the entire procedure. Following the sedation, this responsible adult should remain with you for the next 24 hours.</p>

              <p><strong>5.</strong> Please wear clothing that is not restrictive to the neck or arms. Please wear loose-fitting tops on which the sleeves can be rolled up to the shoulder. Also, please be sure to wear shoes that are securely fastened; no flip-flops, or loose-fitting sandals.</p>

              <p><strong>6.</strong> Do not wear perfume, body lotion or jewellery. Remove all nail polish.</p>

              <p><strong>7.</strong> Remove contact lenses before surgery.</p>

              <p><strong>8.</strong> Do not drive to the office, please ask a responsible adult to drive you to the office. Following the sedation, you should refrain from driving an automobile or engaging in any activity that requires alertness for the next 24 hours.</p>

              <p className="mt-4">If you have any questions about the I.V. Sedation process, please feel free to contact Dr. Germain Jean Charles at (585) 394-5910 or by email at contact@nysdentalimplants.com, prior to the procedure.</p>
            </div>
          </CardContent>
        </Card>

        {/* Pre-operative Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-purple-600" />
              Surgical Pre-operative Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                All patients are required to begin the regimen below before surgery unless otherwise exempt or allergic to the medications prescribed. All medications will be called directly to the pharmacy THREE (3) days prior to your Appointment, please call the office if additional arrangements need to be made.
              </p>
              <p className="text-sm text-red-800 font-bold">
                Please DO NOT TAKE THESE MEDICATION THE MORNING OF SURGERY:
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold mb-2">Medication Name: <strong>Medrol 4mg Dose Pack</strong></p>
                <p>Purpose and Directions: Helps suppress bruising and swelling. Please take as directed until finished (6 days). Please take the loading dose (located on the lower right of the packet), then continue with directions as located under each row in the packet</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold mb-2">Medication Name: <strong>Amoxicillin 500mg x 30 tabs</strong> (Another Antibiotic may have been prescribed if allergic)</p>
                <p>Directions: Please take one (1) tablet by mouth THREE (3) times a day. Please begin regimen 3 DAYS BEFORE surgery and continue after surgery.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold mb-2">Medication Name: <strong>Diazepam 10 mg (Valium)</strong></p>
                <p>Directions: Please take one (1) tablet the night before surgery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informed Consent for Full-Arch Surgery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Informed Consent for Full-Arch Surgery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="mb-3">
                <span className="font-semibold">TO THE PATIENT:</span> You have the right as a patient, to be informed about your condition and about the recommended surgical, medical, or diagnostic procedures to be used that can help you make an informed decision before undergoing any procedures. You also have the right to know the risks and potential complications that may be involved by undergoing the procedures prescribed. This disclosure is not meant to scare or intimidate you; it is simply an effort to make you better informed so you can give or withhold your consent to the procedures being performed.
              </p>
              <p className="font-semibold">
                The following consent packet covers all procedures that are performed concurrently or in sequence in our full-arch rehabilitation process that includes but not limited to: Dental Extraction; Guided Tissue Regeneration (GTR) or bone grafting; Biopsy, Implant Placement; Nitrous Oxide and/or IV sedation.
              </p>
            </div>

            <div className="text-sm">
              <p>The consequence of not performing the necessary steps to rehabilitate my mouth may include but not limited to the following: Continuation, growth, and/or spread of infection; Pain and swelling; Systemic infection such as fever, sepsis, and (in rare cases) death; and Aspiration (inhaling) of loose teeth or tooth fragments.</p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2">AUTHORIZATION:</p>
                <p>I understand that the Full Arch Treatment with the office will involve the extraction of all my remaining teeth (if applicable) followed by grafting as necessary and subsequent immediate implant placement if adequate condition permits. The procedural sequence has been presented and explained to me in pre-consultation prior to this consent.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">RISKS:</p>
                <p>I understand that Oral Surgery and/or Dental Extractions; GTR or Grafting; Implant placement involve possible inherent risks such as, but not limited to the following: Pain and swelling; Injury to surrounding soft tissues; Reversible or irreversible nerve damage; Dry socket (a painful, noninfectious complication); Infection; Adverse reactions to medications, local anesthetic injection or IV catheter placement. Retained fragments of teeth in the jaw (if the risk of removal outweighs the benefit); Perforation of the maxillary sinus, possibly requiring further treatment; and In rare cases, fracture of the jaw requiring further treatment; Delay in delivering final prosthesis.</p>
              </div>

              <div>
                <p>I understand the procedures involved in Full-Arch Rehabilitation are permanent and that I give consent to have them performed on me today. I was presented with other treatment options such as NO TREATMENT AT ALL; I was invited and encouraged to ask questions which were answered to my satisfaction. I, NOW voluntarily, agree to proceed with Full-Arch Rehabilitation involving dental implants. The fee(s) for this service have been explained to me and are satisfactory.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">PURPOSE OF EXTRACTION:</p>
                <p>The extraction of all the remaining teeth helps to eliminate and treat any existing sites of infection if present and/or pain. It also allows for the establishment of solid foundation for the new guided prosthesis.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">PURPOSE OF GRAFTING:</p>
                <p>The grafting procedure serves as an attempt to regenerate bone to an area where bone loss or atrophy occurred due to dental infection or previous loss of teeth.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">PURPOSE OF IMPLANT PLACEMENT:</p>
                <p>The placement of the titanium implant(s) in the jaw will serve as a root replacement/anchor to stabilize a final prosthesis such as a <strong>FIXED BRIDGE or A REMOVABLE DENTURE</strong>. I understand that the FINAL PROSTHESIS is another procedure that will be performed later after all healing is completed. The implants may be left to heal underneath your gums for a few months before the final restoration is placed. In such case, you will be placed on a regular conventional complete denture awaiting complete healing of the implants.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">NO GUARANTEE OF TREATMENT RESULTS:</p>
                <p>I understand that there is no way to accurately predict the healing of a specific patient including the final height of the gums, and that there has been no guarantee given.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">IMPORTANCE OF PATIENT COMPLIANCE:</p>
                <p>I understand that meticulous oral hygiene must be maintained, and that smoking, excessive alcohol consumption, and improper diet practice must be avoided. Failure to maintain good oral hygiene or modify any nefarious behavior may affect the healing of the grafted material and/or the osseointegration of the implants which may lead to subsequent graft and/or implant failure.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">PERIODIC CHECKUPS:</p>
                <p>I understand that periodic exams and cleanings which are FREE for a period of two years are important to the success of my Full-Arch Rehabilitation. Failure to maintain these checkups without notice will void my warranty. Any changes to MY BITE or discomfort at the surgical site must be reported immediately as it may compromise long term survival of MY implants.</p>
              </div>

              <div>
                <p>By signing this form, I am freely giving my consent to allow and authorize Dr. Charles and/or his associates to render any treatment necessary or advisable to my dental conditions, including any and all anesthetics and/or medications. I will follow the verbal and written postoperative instructions and return for all follow-up appointments as covered in the procedure sequence sheet.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authorization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Authorization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">AUTHORIZATION:</p>
                <p>I hereby authorize Dr. Charles and his assistant(s) to extract MY remaining teeth (if applicable) as a baseline preparation for Full-Arch Rehabilitation.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">AUTHORIZATION:</p>
                <p>I hereby authorize Dr. Charles and his assistant(s) to perform <strong>guided tissue regeneration (GTR)/Grafting</strong> as needed for my Full-Arch Rehabilitation using Autogenous graft (my OWN bone) and Allograft materials (sterile human donor bone) in combination with resorbable collagen membrane as needed.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">AUTHORIZATION:</p>
                <p>I hereby authorize Dr. Charles and his assistant(s) to insert <strong>dental implant(s)</strong> in my jaw as needed.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informed Consent for Conscious Sedation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-indigo-600" />
              Informed Consent for Conscious Sedation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">DIAGNOSIS:</p>
                <p>I have been informed that my treatment can be performed with a variety of types of anesthetics, including local anesthesia, local anesthesia with Nitrous Oxide sedation or local anesthesia with IV conscious sedation. Dr. Germain Jean-Charles has recommended Intra-Venous (IV) conscious sedation in addition to other possible forms of anesthetic to alleviate the stress involved with this type of procedure.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">RECOMMENDED TREATMENT:</p>
                <p>I understand that in IV conscious sedation, small doses of various medications will be administered to produce a state of relaxation, reduced perception of pain, and drowsiness. While in the relaxation state, local anesthetics will be administered to ensure proper anesthesia in the areas of my mouth to be operated on comfortably and pain free. I understand that the drugs to be used may include midazolam and fentanyl. I recognize that I must do several things prior to conscious sedation: I must refrain from eating and drinking for at least <strong>eight (8) hours</strong> before my appointment. I must not wear necklaces, earrings, fingernail polish, perfumes, colognes, or aftershaves. I must wear warm comfortable clothing with a short sleeve shirt/blouse.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">EXPECTED BENEFITS:</p>
                <p>The purpose of conscious sedation is to lessen the significant and undesirable side effects of long or stressful dental procedures by chemically reducing the fear, apprehension, and stresses sometimes associated with these procedures.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">Principal Risks and Complications:</p>
                <p>I understand that occasional complications may be associated with conscious sedation including pain, facial swelling or bruising, inflammation of a vein (phlebitis), infection, bleeding, discoloration, nausea, vomiting, and allergic reaction. I further understand that, in extremely rare instances, cardiac arrest, damage to the brain or other organ supplied by an artery, and even death, can occur. To help minimize risks and complications, I have disclosed to the doctor and the staff all drugs and medications that I am taking. I have also disclosed any abnormalities in my current physical status or past medical history. This includes any history of drug or alcohol abuse and any unusual reactions to medications or anesthetics.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">ALTERNATIVES TO SUGGESTED TREATMENT:</p>
                <p>Alternatives to conscious sedation include local anesthesia, intramuscular sedation, and general anesthesia in the hospital or in a surgical center. Local anesthesia alone may not adequately dispel my fear, anxiety, or stress. If certain medical conditions are present, it may present a greater risk. There may be less control of proper dosage with oral sedation than with IV conscious sedation<strong>.</strong></p>
              </div>

              <div>
                <p className="font-semibold mb-2">NECESSARY FOLLOW-UP CARE AND SELF CARE:</p>
                <p>I understand that I must refrain from drinking alcoholic beverages and taking certain medications for a twenty-four (24) hour period following the administration of conscious sedation. I also understand that a responsible adult needs to drive me home and remain with me until the effects of the sedation have worn off and that I should not attempt to drive or operate any machinery for the remainder of the day on which I receive sedation.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">NO WARRANTY OR GUARANTEE:</p>
                <p>I hereby acknowledge that no guarantee, warranty, or assurance has been given to me that the proposed treatment will be successful. I recognize that, as noted above, there are risks and potential complications in the administration of conscious sedation.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">PATIENT CONSENT:</p>
                <p>I have been fully informed of the nature of IV conscious sedation, the procedure to be utilized, the risks and benefits of this form of sedation, the alternatives available, and the necessity for follow-up. I have had an opportunity to ask any questions I may have in connection with the procedure, and to discuss my concerns with my Dentist. After thorough consideration, I hereby consent to the administration of IV conscious sedation as presented to me during consultation and explained in this document.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">AUTHORIZATION:</p>
                <p>I CERTIFY THAT I HAVE READ AND FULLY UNDERSTOOD THIS DOCUMENT AND THEREFORE AGREED TO THE ADMINISTRATION OF IV CONCIOUS SEDATION FOR MY PROCEDURE.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-operative Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Post-operative Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2">DO NOT DISTURB THE AREA:</p>
                <p>For the next few days, and especially the first 24 hours, it is important to allow your body to form a good clot and start the natural healing process. Swishing, sucking through a straw, and smoking can all dislodge the clot. Keep anything sharp from entering the site of implant placement (crunchy food, toothpicks, eating utensils). Be sure to limit chewing too heavily and adopt soft diet during the healing phase of the implants.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">BLEEDING:</p>
                <p>When you leave the office, you might be biting on a gauze pad to control bleeding. Keep slight pressure on this gauze for at least 30 minutes. Do not change the gauze during this time; it needs to remain undisturbed while a clot forms to stop any bleeding. After 30 minutes, you may remove it. Small amounts of blood in the saliva can make your saliva appear quite red. This is normal and may be noticed the rest of the day after the procedure.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">SMOKING:</p>
                <p>Smoking should be stopped following any surgery. Specially in implant surgery, we advise patient to abstain or quit the habit for better implant long term survival. Healing and success of the surgery will be substantially reduced by the cigarette smoke chemicals in your body. Also, the suction created when inhaling cigarettes can affect implant long term survival. Smokers are at greater risk of developing painful post-operative problems.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">PAIN:</p>
                <p>Some discomfort is normal after surgery. To minimize pain, Take the medications as prescribed as soon as the anesthetic wears off and before bedtime to maintain comfort. Do not exceed the dose on the label. Taking with food or milk will help reduce upset stomach. Avoid driving or operating heavy machinery when taking pain prescriptions. Do not drink alcohol while taking prescription pain medications.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">NAUSEA:</p>
                <p>This is most often caused by taking pain medications on an empty stomach. Avoid taking your medications on an empty stomach to reduce nausea and use water to take them.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">SWELLING:</p>
                <p>Applying an ice bag to the face over the side of surgery will help minimize or contain swelling. Apply the ice pack 10 minutes on and then 15 minutes off. Do this for the first day.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">NUMBNESS:</p>
                <p>The local anesthetic will cause you to be numb for several hours after you leave the office. Be careful not to bite, chew, pinch, or scratch the numb area. Sometimes surgical procedures in the mouth cause residual numbness or tingling for six weeks or longer.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">BRUSHING:</p>
                <p>Do not brush your teeth for the first 8 hours after surgery. You may resume brushing your teeth gently the following days after surgery, but do not brush the surgical site.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">RINSING:</p>
                <p>Avoid all rinsing or swishing for 24 hours after extraction. Rinsing can disturb the formation of a healing blood clot which is essential to proper healing. This could cause bleeding and risk of post-operative complications. After 24 hours you may begin rinsing gently with a saltwater solution (1/2 teaspoon salt + 1/2 teaspoon soda + 8 ounces' warm water) or the chlorhexidine rinse twice a day morning and evening with 20 ml for two minutes and expectorate for a duration of two weeks.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">DIET:</p>
                <p>Eat soft foods for the first two days. Maintain a good, balanced soft food diet for the first 6-8 weeks period that allow your implants to integrate with your bone. Failure to adhere to a soft diet during that healing phase will affect your implant success and your smile. AVOID FORCEFUL EATING OR CRUNCHING ON THE SITE OF IMPLANT PLACEMENT. Drink plenty of water. Avoid alcohol for 48 hours.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">ACTIVITY:</p>
                <p>After leaving the office, rest and avoid strenuous activities for the remainder of the day. Keeping blood pressure lower will reduce bleeding and aid healing. Make sure a responsible adult can stay with 8 hrs. following surgery specially if your surgery was under IV sedation.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">ANTIBIOTICS:</p>
                <p>Take all antibiotic pill as directed until they are gone. Women: some antibiotics can reduce the effectiveness of birth control pills. Use alternate birth control methods for two months.</p>
              </div>
            </div>

            {/* Single acknowledgment checkbox */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="postOpInstructionsAcknowledged"
                  checked={formData.postOpInstructionsAcknowledged}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, postOpInstructionsAcknowledged: checked as boolean }))}
                />
                <Label htmlFor="postOpInstructionsAcknowledged" className="text-sm cursor-pointer font-medium">
                  I acknowledge that I have read and understand all the post-operative instructions above.
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-operative Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-green-600" />
              Surgical Post-operative Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium mb-2">
                After your surgery: A small amount of Opioid-based analgesics is prescribed in some situations, please use with caution to avoid dependence:
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold mb-2">Medication Name: Amoxicillin 500mg (Another Antibiotics may have been prescribed if allergic)</p>
                <p><strong>Directions:</strong> Following your surgery, take one (1) tablet every 8 hours until finished</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold mb-2">Medication Name: Motrin 800mg or Ibuprofen 800mg</p>
                <p><strong>Directions:</strong> Following surgery take one (1) tablet every 4-6 hours as needed for pain. Stay on this medication for 2-3 days to keep inflammation down.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold mb-2">24 hours After Surgery:</p>
                <p className="font-semibold mb-1">Medication Name: Chlorhexidine</p>
                <p><strong>Directions:</strong> 15ml 3x A Day for 5 minutes.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-gray-600" />
              Signatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-gray-200">
              {/* Patient Column */}
              <div className="space-y-4 md:pr-6">
                <h4 className="font-semibold text-gray-900 border-b pb-2 text-center">Patient Information</h4>

                <div>
                  <Label htmlFor="patientNameForSignature" className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Printed Name of Patient
                  </Label>
                  <Input
                    id="patientNameForSignature"
                    value={formData.patientName}
                    readOnly
                    className="mt-1 bg-gray-50 cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="patientSignatureDate" className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Date Signed
                  </Label>
                  <Input
                    id="patientSignatureDate"
                    type="date"
                    value={formData.patientSignatureDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientSignatureDate: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Patient Signature
                  </Label>
                  <div className="mt-1">
                    {formData.patientSignature ? (
                      <SignaturePreview
                        signature={formData.patientSignature}
                        onEdit={() => setPatientSignatureDialogOpen(true)}
                        onClear={handlePatientSignatureClear}
                        label="Patient Signature"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPatientSignatureDialogOpen(true)}
                        className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Witness Column */}
              <div className="space-y-4 md:pl-6">
                <h4 className="font-semibold text-gray-900 border-b pb-2 text-center">Witness Information</h4>

                <div>
                  <Label htmlFor="witnessName" className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Printed Witness Name
                  </Label>
                  <Input
                    id="witnessName"
                    value={formData.witnessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, witnessName: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="witnessSignatureDate" className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Date Signed
                  </Label>
                  <Input
                    id="witnessSignatureDate"
                    type="date"
                    value={formData.witnessSignatureDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, witnessSignatureDate: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Signature of Witness
                  </Label>
                  <div className="mt-1">
                    {formData.witnessSignature ? (
                      <SignaturePreview
                        signature={formData.witnessSignature}
                        onEdit={() => setWitnessSignatureDialogOpen(true)}
                        onClear={handleWitnessSignatureClear}
                        label="Witness Signature"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setWitnessSignatureDialogOpen(true)}
                        className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
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

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Consent Form
          </Button>
        </div>
      </form>

      {/* Signature Dialogs */}
      <SignatureDialog
        isOpen={patientSignatureDialogOpen}
        onClose={() => setPatientSignatureDialogOpen(false)}
        onSave={handlePatientSignatureSave}
        title="Patient Signature"
        currentSignature={formData.patientSignature}
      />

      <SignatureDialog
        isOpen={witnessSignatureDialogOpen}
        onClose={() => setWitnessSignatureDialogOpen(false)}
        onSave={handleWitnessSignatureSave}
        title="Witness Signature"
        currentSignature={formData.witnessSignature}
      />
    </div>
  );
}
