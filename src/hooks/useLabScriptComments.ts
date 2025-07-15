import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LabScriptComment {
  id: string;
  lab_script_id: string;
  comment_text: string;
  author_name: string | null;
  author_role: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewCommentData {
  comment_text: string;
  author_name?: string;
  author_role?: string;
}

export function useLabScriptComments(labScriptId?: string) {
  const [comments, setComments] = useState<LabScriptComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchComments = async (scriptId?: string) => {
    if (!scriptId && !labScriptId) return;
    
    const targetId = scriptId || labScriptId;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('lab_script_comments')
        .select('*')
        .eq('lab_script_id', targetId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentData: NewCommentData, scriptId?: string) => {
    if (!scriptId && !labScriptId) {
      toast({
        title: "Error",
        description: "Lab script ID is required",
        variant: "destructive",
      });
      return;
    }

    const targetId = scriptId || labScriptId;

    try {
      const { data, error } = await supabase
        .from('lab_script_comments')
        .insert([{
          lab_script_id: targetId,
          comment_text: commentData.comment_text,
          author_name: commentData.author_name || null,
          author_role: commentData.author_role || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      // Refresh comments
      await fetchComments(targetId);
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const updateComment = async (commentId: string, updates: Partial<NewCommentData>) => {
    try {
      const { data, error } = await supabase
        .from('lab_script_comments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        toast({
          title: "Error",
          description: "Failed to update comment",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });

      // Refresh comments
      await fetchComments();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('lab_script_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: "Error",
          description: "Failed to delete comment",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (labScriptId) {
      fetchComments();
    }
  }, [labScriptId]);

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    updateComment,
    deleteComment
  };
}
