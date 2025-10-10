import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string;
  user_type: 'customer' | 'designer';
  user_name: string;
  activity_type: string;
  description: string;
  changes: any;
  old_values: any;
  new_values: any;
  created_at: string;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version: number;
  data: any;
  created_by: string;
  created_by_type: 'customer' | 'designer';
  created_by_name: string;
  change_summary: string;
  created_at: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  designer_id: string;
  customer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_at: string;
  responded_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useProjectTracking = (projectId?: string) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectActivities = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('project_activities')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching project activities:', error);
      setError(error.message);
    }
  };

  const fetchProjectVersions = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('project_versions')
        .select('*')
        .eq('project_id', id)
        .order('version', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: any) {
      console.error('Error fetching project versions:', error);
      setError(error.message);
    }
  };

  const fetchProjectAssignments = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('project_assignments')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      console.error('Error fetching project assignments:', error);
      setError(error.message);
    }
  };

  const assignProjectToDesigner = async (projectId: string, designerEmail: string, message?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // First, find the designer by email
      const { data: designer, error: designerError } = await supabase
        .from('designers')
        .select('id, user_id, name')
        .eq('email', designerEmail.toLowerCase())
        .eq('is_active', true)
        .single();

      if (designerError || !designer) {
        throw new Error('Designer not found or inactive');
      }

      // Update the project with assignment
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          assigned_designer_id: designer.id,
          assignment_status: 'assigned',
          last_modified_by: user.id
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('project_assignments')
        .insert({
          project_id: projectId,
          designer_id: designer.id,
          customer_id: user.id,
          status: 'pending',
          notes: message
        });

      if (assignmentError) throw assignmentError;

      return { success: true };
    } catch (error: any) {
      console.error('Error assigning project:', error);
      throw error;
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('project_assignments')
        .update({
          status,
          notes,
          responded_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (error) throw error;

      // Refresh assignments
      if (projectId) {
        await fetchProjectAssignments(projectId);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating assignment status:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      Promise.all([
        fetchProjectActivities(projectId),
        fetchProjectVersions(projectId),
        fetchProjectAssignments(projectId)
      ]).finally(() => setLoading(false));
    }
  }, [projectId]);

  return {
    activities,
    versions,
    assignments,
    loading,
    error,
    assignProjectToDesigner,
    updateAssignmentStatus,
    refreshData: () => {
      if (projectId) {
        fetchProjectActivities(projectId);
        fetchProjectVersions(projectId);
        fetchProjectAssignments(projectId);
      }
    }
  };
};