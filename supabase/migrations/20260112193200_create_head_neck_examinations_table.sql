CREATE TABLE IF NOT EXISTS public.head_neck_examinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    vital_signs JSONB DEFAULT '{}'::jsonb,
    medical_history JSONB DEFAULT '{}'::jsonb,
    chief_complaints JSONB DEFAULT '{}'::jsonb,
    extra_oral_examination JSONB DEFAULT '{}'::jsonb,
    intra_oral_examination JSONB DEFAULT '{}'::jsonb,
    dental_classification JSONB DEFAULT '{}'::jsonb,
    skeletal_presentation JSONB DEFAULT '{}'::jsonb,
    functional_presentation JSONB DEFAULT '{}'::jsonb,
    clinical_observation JSONB DEFAULT '{}'::jsonb,
    tactile_observation JSONB DEFAULT '{}'::jsonb,
    radiographic_presentation JSONB DEFAULT '{}'::jsonb,
    tomography_data JSONB DEFAULT '{}'::jsonb,
    
    evaluation_notes TEXT DEFAULT '[]',
    maxillary_sinuses_evaluation JSONB DEFAULT '{"left": [], "right": []}'::jsonb,
    airway_evaluation TEXT DEFAULT '',
    
    guideline_questions JSONB DEFAULT '{}'::jsonb,
    
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed'))
);

-- Enable RLS
ALTER TABLE public.head_neck_examinations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON public.head_neck_examinations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_head_neck_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_head_neck_examinations_updated_at
    BEFORE UPDATE ON public.head_neck_examinations
    FOR EACH ROW
    EXECUTE PROCEDURE update_head_neck_updated_at();
