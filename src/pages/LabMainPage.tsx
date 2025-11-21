import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, FileText, Factory, Package, Microscope } from "lucide-react";

export function LabMainPage() {
  const navigate = useNavigate();

  const labSections = [
    {
      title: "Lab Scripts",
      description: "Manage lab scripts and orders for patient treatments",
      icon: FlaskConical,
      href: "/lab/lab-scripts",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Report Cards",
      description: "View and manage lab report cards and documentation",
      icon: FileText,
      href: "/lab/report-cards",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Manufacturing",
      description: "Track manufacturing processes and production status",
      icon: Factory,
      href: "/lab/manufacturing",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Appliance Delivery",
      description: "Manage appliance delivery schedules and tracking",
      icon: Package,
      href: "/lab/appliance-delivery",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Lab Management"
        description="Access all lab-related functions and workflows"
        icon={Microscope}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {labSections.map((section) => (
            <Card
              key={section.href}
              className={`cursor-pointer transition-all duration-200 ${section.hoverColor} border-2 ${section.borderColor} hover:shadow-lg`}
              onClick={() => navigate(section.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`${section.color} p-3 rounded-lg`}>
                    <section.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end text-sm text-gray-500">
                  Click to access →
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

