import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export interface ConsultationFilters {
    treatmentStatus: string[];
    appointmentStatus: string[];
}

interface ConsultationFilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentFilters: ConsultationFilters;
    onApplyFilters: (filters: ConsultationFilters) => void;
    onClearFilters: () => void;
}

export function ConsultationFilterDialog({
    open,
    onOpenChange,
    currentFilters,
    onApplyFilters,
    onClearFilters
}: ConsultationFilterDialogProps) {
    const [localFilters, setLocalFilters] = useState<ConsultationFilters>(currentFilters);
    const [counts, setCounts] = useState<{
        treatmentStatus: Record<string, number>;
        appointmentStatus: Record<string, number>;
    }>({
        treatmentStatus: {},
        appointmentStatus: {}
    });

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters, open]);

    useEffect(() => {
        if (open) {
            fetchCounts();
        }
    }, [open]);

    const fetchCounts = async () => {
        try {
            // Fetch data from consultation_patients view to match table data
            const { data, error } = await supabase
                .from('consultation_patients')
                .select('treatment_decision, status');

            if (error) {
                // Fallback to consultations table if view doesn't exist or errors
                console.error("Error fetching from consultation_patients, falling back:", error);
                const { data: consultations, error: consultError } = await supabase
                    .from('consultations')
                    .select('treatment_decision');

                if (consultError) throw consultError;

                const treatCounts: Record<string, number> = {};
                consultations?.forEach(c => {
                    const decision = c.treatment_decision || 'not_set';
                    treatCounts[decision] = (treatCounts[decision] || 0) + 1;
                });

                setCounts({
                    treatmentStatus: treatCounts,
                    appointmentStatus: {}
                });
                return;
            }

            const treatCounts: Record<string, number> = {};
            const apptCounts: Record<string, number> = {};

            // Initialize appt counts to 0
            const apptCategories = [
                'Complete Appointment',
                'Not Confirmed',
                'Appointment Confirmed',
                'Electronically Confirmed',
                'Emergency Patient',
                'Patient has Arrived',
                'Ready for Operatory',
                'Left 1st Message',
                'Left 2nd Message',
                'Multi-Appointment',
                '2 Week Calls',
                'No Show',
                'Reschedule Appointment',
                'Cancel Appointment'
            ];
            apptCategories.forEach(cat => apptCounts[cat] = 0);

            data?.forEach(row => {
                // Count Treatment Status
                const decision = row.treatment_decision || 'not_set';
                treatCounts[decision] = (treatCounts[decision] || 0) + 1;

                // Count Appointment Status
                const s = (row.status || '').toLowerCase();
                let category = '';

                if (s.includes('complet') || s.includes('cmplt')) category = 'Complete Appointment';
                else if (s.includes('electronic')) category = 'Electronically Confirmed';
                else if (s.includes('not confirmed') || s.includes('?????')) category = 'Not Confirmed';
                else if (s.includes('nshow') || s.includes('no show')) category = 'No Show';
                else if (s.includes('cancel') || s.includes('cancl')) category = 'Cancel Appointment';
                else if (s.includes('resch')) category = 'Reschedule Appointment';
                else if (s.includes('emergency')) category = 'Emergency Patient';
                else if (s.includes('here') || s.includes('arriv')) category = 'Patient has Arrived';
                else if (s.includes('ready')) category = 'Ready for Operatory';
                else if (s.includes('left 2nd')) category = 'Left 2nd Message';
                else if (s.includes('left 1st') || s.includes('lm')) category = 'Left 1st Message';
                else if (s.includes('multi')) category = 'Multi-Appointment';
                else if (s.includes('2wk') || s.includes('2 week')) category = '2 Week Calls';
                else if (s.includes('confirm') || s.includes('firm')) category = 'Appointment Confirmed';
                else if (s === '' || s === 'pending') category = 'Not Confirmed';
                else category = 'Not Confirmed';

                if (apptCounts[category] !== undefined) {
                    apptCounts[category] = (apptCounts[category] || 0) + 1;
                }
            });

            setCounts({
                treatmentStatus: treatCounts,
                appointmentStatus: apptCounts
            });

        } catch (error) {
            console.error('Error fetching filter counts:', error);
        }
    };

    const handleButtonToggle = (category: keyof ConsultationFilters, value: string) => {
        setLocalFilters(prev => {
            const currentArray = prev[category];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return { ...prev, [category]: newArray };
        });
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
    };

    const handleClear = () => {
        setLocalFilters({
            treatmentStatus: [],
            appointmentStatus: []
        });
        onClearFilters();
    };

    // Predefined options
    // Treatment Statuses based on existing code
    const treatmentOptions = [
        { value: 'accepted', label: 'Accepted' },
        { value: 'not_accepted', label: 'Rejected' },
        { value: 'followup-required', label: 'Follow-up Required' },
        { value: 'not_set', label: 'Not Set' }
    ];

    // Appointment Statuses
    const appointmentOptions = [
        { value: 'Complete Appointment', label: 'Complete Appointment' },
        { value: 'Not Confirmed', label: 'Not Confirmed' },
        { value: 'Appointment Confirmed', label: 'Appointment Confirmed' },
        { value: 'Electronically Confirmed', label: 'Electronically Confirmed' },
        { value: 'Emergency Patient', label: 'Emergency Patient' },
        { value: 'Patient has Arrived', label: 'Patient has Arrived' },
        { value: 'Ready for Operatory', label: 'Ready for Operatory' },
        { value: 'Left 1st Message', label: 'Left 1st Message' },
        { value: 'Left 2nd Message', label: 'Left 2nd Message' },
        { value: 'Multi-Appointment', label: 'Multi-Appointment' },
        { value: '2 Week Calls', label: '2 Week Calls' },
        { value: 'No Show', label: 'No Show' },
        { value: 'Reschedule Appointment', label: 'Reschedule Appointment' },
        { value: 'Cancel Appointment', label: 'Cancel Appointment' }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-blue-600">Filter Consultations</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Treatment Status Filter */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-900">Treatment Status</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {treatmentOptions.map(option => {
                                const count = counts.treatmentStatus[option.value] || 0;
                                const isSelected = localFilters.treatmentStatus.includes(option.value);
                                return (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        className={`justify-between ${isSelected
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleButtonToggle('treatmentStatus', option.value)}
                                    >
                                        <span>{option.label}</span>
                                        {count > 0 && (
                                            <Badge variant="secondary" className={`ml-2 ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                {count}
                                            </Badge>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Appointment Status Filter */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-900">Appointment Status</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {appointmentOptions.map(option => {
                                const count = counts.appointmentStatus[option.value] || 0;
                                const isSelected = localFilters.appointmentStatus.includes(option.value);
                                return (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        className={`justify-between ${isSelected
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleButtonToggle('appointmentStatus', option.value)}
                                    >
                                        <span>{option.label}</span>
                                        {count > 0 && (
                                            <Badge variant="secondary" className={`ml-2 ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                {count}
                                            </Badge>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            * Counts for appointment statuses are calculated on list load.
                        </p>
                    </div>

                </div>

                <DialogFooter className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                        Clear All
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
