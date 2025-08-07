// Simple test script to verify the patient summary functionality
import { supabase } from './integrations/supabase/client.js';

// Test data
const testSummary = {
  patient_packet_id: 'test-packet-id',
  medical_history_summary: 'Test medical history summary',
  allergies_summary: 'Test allergies summary',
  dental_history_summary: 'Test dental history summary',
  attention_items: ['Test attention item 1', 'Test attention item 2'],
  potential_complications: ['Test complication 1', 'Test complication 2'],
  overall_assessment: 'Test overall assessment'
};

async function testSummaryDatabase() {
  try {
    console.log('Testing patient summary database operations...');
    
    // Test insert
    const { data: insertData, error: insertError } = await supabase
      .from('patient_summaries')
      .insert(testSummary)
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return;
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Test select
    const { data: selectData, error: selectError } = await supabase
      .from('patient_summaries')
      .select('*')
      .eq('id', insertData.id)
      .single();
    
    if (selectError) {
      console.error('Select error:', selectError);
      return;
    }
    
    console.log('✅ Select successful:', selectData);
    
    // Test update
    const updatedSummary = {
      ...testSummary,
      medical_history_summary: 'Updated medical history summary'
    };
    
    const { data: updateData, error: updateError } = await supabase
      .from('patient_summaries')
      .update(updatedSummary)
      .eq('id', insertData.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }
    
    console.log('✅ Update successful:', updateData);
    
    // Test delete
    const { error: deleteError } = await supabase
      .from('patient_summaries')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return;
    }
    
    console.log('✅ Delete successful');
    console.log('🎉 All database operations completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  window.testSummaryDatabase = testSummaryDatabase;
  console.log('Test function available as window.testSummaryDatabase()');
} else {
  testSummaryDatabase();
}
