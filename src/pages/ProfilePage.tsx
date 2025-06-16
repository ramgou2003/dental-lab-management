
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Camera, Mail, Phone, MapPin, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader title="Profile" />
      </div>
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-12">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white text-indigo-600 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                      {getInitials("Amelia", "Stone")}
                    </div>
                  )}
                  <button 
                    onClick={() => document.getElementById('profile-upload')?.click()}
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">Dr. Amelia Stone</h1>
                  <p className="text-indigo-100 text-lg">General Dentistry</p>
                  <p className="text-indigo-200 text-sm mt-1">DDS, University of California</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">amelia.stone@dentalclinic.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">123 Medical Center Dr, San Francisco, CA</span>
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">License #: CA-DEN-12345</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">15 years of experience</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {["General Dentistry", "Cosmetic Dentistry", "Oral Surgery", "Pediatric Dentistry", "Orthodontics"].map((spec) => (
                    <span key={spec} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex space-x-4">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Edit Profile
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
