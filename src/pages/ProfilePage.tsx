
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Camera, Mail, Phone, MapPin, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  title?: string;
  specialty?: string;
  education?: string;
  license_number?: string;
  years_experience?: number;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  specializations?: string[];
}

export function ProfilePage() {
  const { userProfile, user, userRoles } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has doctor role
  const isDentist = userRoles.some(role => role.name === 'dentist');

  // Fetch detailed profile data with roles
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_roles!inner (
              status,
              roles (
                id,
                name,
                display_name
              )
            )
          `)
          .eq('id', user.id)
          .eq('user_roles.status', 'active')
          .single();

        if (error) {
          console.error('Error fetching profile data:', error);
          toast.error('Failed to load profile data');
          return;
        }

        setProfileData(data);
        if (data.avatar_url) {
          setProfileImage(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Use profileData if available, fallback to userProfile, then to defaults
  const displayData = profileData || userProfile;
  if (!displayData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

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
                      {getInitials(displayData.first_name, displayData.last_name)}
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
                  <h1 className="text-3xl font-bold">
                    {isDentist ? 'Dr. ' : ''}{displayData.first_name} {displayData.last_name}
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    {displayData.specialty || (isDentist ? 'General Dentistry' : 'Staff Member')}
                  </p>
                  {displayData.education && (
                    <p className="text-indigo-200 text-sm mt-1">{displayData.education}</p>
                  )}
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
                      <span className="text-gray-600">{displayData.email}</span>
                    </div>
                    {displayData.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">{displayData.phone}</span>
                      </div>
                    )}
                    {(displayData.address_street || displayData.address_city || displayData.address_state) && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">
                          {[
                            displayData.address_street,
                            displayData.address_city,
                            displayData.address_state
                          ].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Details */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
                  <div className="space-y-4">
                    {isDentist && displayData.license_number && (
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">License #: {displayData.license_number}</span>
                      </div>
                    )}
                    {displayData.years_experience !== undefined && displayData.years_experience > 0 && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">
                          {displayData.years_experience} {displayData.years_experience === 1 ? 'year' : 'years'} of experience
                        </span>
                      </div>
                    )}
                    {/* Show user roles */}
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">
                        Role: {userRoles.map(role => role.display_name).join(', ') || 'User'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              {/* Only show specializations for dentists */}
              {isDentist && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h2>
                  <div className="flex flex-wrap gap-2">
                    {(displayData.specializations || ['General Dentistry']).map((spec) => (
                      <span key={spec} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
