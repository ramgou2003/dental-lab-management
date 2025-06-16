
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
  format: string;
}

const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1", format: "(###) ###-####" },
  { code: "CA", name: "Canada", flag: "🇨🇦", phoneCode: "+1", format: "(###) ###-####" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", phoneCode: "+44", format: "#### ### ####" },
  { code: "AU", name: "Australia", flag: "🇦🇺", phoneCode: "+61", format: "#### ### ###" },
  { code: "DE", name: "Germany", flag: "🇩🇪", phoneCode: "+49", format: "### ########" },
  { code: "FR", name: "France", flag: "🇫🇷", phoneCode: "+33", format: "# ## ## ## ##" },
  { code: "IN", name: "India", flag: "🇮🇳", phoneCode: "+91", format: "##### #####" },
  { code: "JP", name: "Japan", flag: "🇯🇵", phoneCode: "+81", format: "##-####-####" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", phoneCode: "+55", format: "(##) #####-####" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", phoneCode: "+52", format: "### ### ####" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function PhoneInput({ value, onChange, required }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to US
  const [phoneNumber, setPhoneNumber] = useState("");

  const formatPhoneNumber = (number: string, format: string) => {
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, '');
    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
      if (format[i] === '#') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }

    return formatted;
  };

  const handlePhoneChange = (inputValue: string) => {
    const formatted = formatPhoneNumber(inputValue, selectedCountry.format);
    setPhoneNumber(formatted);
    onChange(`${selectedCountry.phoneCode} ${formatted}`);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      const formatted = formatPhoneNumber(phoneNumber, country.format);
      setPhoneNumber(formatted);
      onChange(`${country.phoneCode} ${formatted}`);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Phone Number</Label>
      <div className="flex gap-2">
        <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-48">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.phoneCode}</span>
                <span className="text-sm text-gray-500">{selectedCountry.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.phoneCode}</span>
                  <span>{country.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          placeholder={selectedCountry.format.replace(/#/g, '0')}
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}
