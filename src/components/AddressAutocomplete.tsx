
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressResult {
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface AddressAutocompleteProps {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  onAddressChange: (field: string, value: string) => void;
}

export function AddressAutocomplete({ 
  street, 
  city, 
  state, 
  zipCode, 
  onAddressChange 
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStreetChange = (value: string) => {
    onAddressChange('street', value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(value);
      setShowSuggestions(true);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: AddressResult) => {
    const { address } = suggestion;
    
    // Build street address
    const streetParts = [];
    if (address.house_number) streetParts.push(address.house_number);
    if (address.road) streetParts.push(address.road);
    const streetAddress = streetParts.join(' ');
    
    // Update form fields
    onAddressChange('street', streetAddress);
    onAddressChange('city', address.city || address.town || address.village || '');
    onAddressChange('state', address.state || '');
    onAddressChange('zipCode', address.postcode || '');
    
    // Hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Address</Label>
      <div className="relative" ref={dropdownRef}>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={street}
          onChange={(e) => handleStreetChange(e.target.value)}
          placeholder="Start typing an address..."
          className="relative"
        />
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
            {loading && (
              <div className="p-3 text-gray-500 text-sm">Searching...</div>
            )}
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
              >
                <div className="font-medium truncate">
                  {suggestion.display_name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => onAddressChange('city', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="CA"
            value={state}
            onChange={(e) => onAddressChange('state', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="zipCode">ZIP Code</Label>
        <Input
          id="zipCode"
          placeholder="12345"
          value={zipCode}
          onChange={(e) => onAddressChange('zipCode', e.target.value)}
        />
      </div>
    </div>
  );
}
