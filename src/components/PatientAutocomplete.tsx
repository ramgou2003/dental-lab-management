import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Search, User, Check } from "lucide-react";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
}

interface PatientAutocompleteProps {
  value: string;
  onChange: (patientId: string, patientName: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function PatientAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Search for a patient...",
  required = false 
}: PatientAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize searchTerm with value prop (for edit forms)
  useEffect(() => {
    if (value && value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  // Search patients from database
  const searchPatients = async (query: string) => {
    if (query.length < 1) {
      setPatients([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for patients with query:', query);

      // Use the same approach as PatientsTable - select all fields first
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('All patients from DB:', data, error);

      if (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
        return;
      }

      // Filter on the client side like PatientsTable does
      const filteredPatients = (data || []).filter(patient =>
        patient.full_name.toLowerCase().includes(query.toLowerCase()) ||
        (patient.first_name && patient.first_name.toLowerCase().includes(query.toLowerCase())) ||
        (patient.last_name && patient.last_name.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10); // Limit to 10 results

      console.log('Filtered patients:', filteredPatients);
      setPatients(filteredPatients);
    } catch (error) {
      console.error('Error:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setIsOpen(true);
    
    // Clear selection if user is typing
    if (selectedPatient && query !== selectedPatient.full_name) {
      setSelectedPatient(null);
      onChange("", "");
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.full_name);
    setIsOpen(false);
    onChange(patient.id, patient.full_name);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (searchTerm.length >= 1) {
      searchPatients(searchTerm);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search when searchTerm changes
  useEffect(() => {
    if (searchTerm.length >= 1 && isOpen) {
      const timeoutId = setTimeout(() => {
        searchPatients(searchTerm);
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      setPatients([]);
    }
  }, [searchTerm, isOpen]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  };

  return (
    <div className="relative">
      <Label htmlFor="patientSearch">
        Patient Name {required && "*"}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          id="patientSearch"
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-10"
          required={required}
          autoComplete="off"
        />
        {selectedPatient && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                Searching...
              </div>
            </div>
          ) : patients.length > 0 ? (
            <div className="py-1">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-600 text-white text-xs font-semibold">
                        {getInitials(patient.first_name, patient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {patient.full_name}
                      </p>
                      {patient.phone && (
                        <p className="text-xs text-gray-500 truncate">
                          {patient.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 1 ? (
            <div className="p-3 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                No patients found
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
