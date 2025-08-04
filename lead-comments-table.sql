-- Create lead_comments table to store comments for leads
CREATE TABLE IF NOT EXISTS lead_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general' CHECK (comment_type IN ('general', 'follow_up', 'status_change', 'important')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to new_patient_leads
ALTER TABLE lead_comments 
ADD CONSTRAINT fk_lead_comments_lead_id 
FOREIGN KEY (lead_id) REFERENCES new_patient_leads(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_lead_comments_lead_id ON lead_comments(lead_id);
CREATE INDEX idx_lead_comments_created_at ON lead_comments(created_at DESC);

-- Enable RLS
ALTER TABLE lead_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all lead comments" ON lead_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert lead comments" ON lead_comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own lead comments" ON lead_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead comments" ON lead_comments
  FOR DELETE USING (auth.uid() = user_id);
