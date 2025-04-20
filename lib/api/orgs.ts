import { supabase } from '@/lib/supabase';
import type { Orgs, OrgMember } from '@/lib/types/database';

export async function createOrganization(name: string, description = ''): Promise<Orgs> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError;
  
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert([{ name, description }])
      .select()
      .single();
  
    if (orgError) throw orgError;
  
    const { error: memberError } = await supabase
      .from('org_members')
      .insert([{
        org_id: org.id,
        user_id: user.id,
        role: 'admin',
      }]);
  
    if (memberError) throw memberError;
  
    return org;
  }
  

  export async function getOrganization(id: string): Promise<Orgs | null> {
    const { data, error } = await supabase
      .from('orgs')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  
    return data;
  }

  
  // admin only
  export async function deleteOrganization(id: string): Promise<void> {
    const isAdmin = await isOrgAdmin(id);
    if (!isAdmin) throw new Error('Only admins can delete an organization');
  
    const { error } = await supabase
      .from('orgs')
      .delete()
      .eq('id', id);
  
    if (error) throw error;
  }
  

  // admin only
  export async function addMemberToOrganization(org_id: string, user_id: string, role: 'admin' | 'member' = 'member'): Promise<void> {
    const isAdmin = await isOrgAdmin(org_id);
    if (!isAdmin) throw new Error('Only admins can add members to an organization');
  
    const { error } = await supabase
      .from('org_members')
      .insert([{ org_id, user_id, role }]);
  
    if (error) throw error;
  }
  

  //admin only
  export async function removeMemberFromOrganization(org_id: string, user_id: string): Promise<void> {
    const isAdmin = await isOrgAdmin(org_id);
    if (!isAdmin) throw new Error('Only admins can remove members from an organization');
  
    const { error } = await supabase
      .from('org_members')
      .delete()
      .eq('org_id', org_id)
      .eq('user_id', user_id);
  
    if (error) throw error;
  }
  
 

  export async function getOrgMembers(org_id: string): Promise<OrgMember[]> {
    const { data, error } = await supabase
      .from('org_members')
      .select('*, user:users(*)')
      .eq('org_id', org_id);
  
    if (error) throw error;
  
    return data;
  }
  

  export async function getUserRoleInOrg(org_id: string): Promise<'admin' | 'member' | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError;
  
    const { data, error } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', org_id)
      .eq('user_id', user.id)
      .single();
  
    if (error || !data) return null;
  
    return data.role;
  }
  
  export async function isOrgAdmin(org_id: string): Promise<boolean> {
    const role = await getUserRoleInOrg(org_id);
    return role === 'admin';
  }