import { supabase } from '@/lib/supabase';
import type { Orgs, OrgMember } from '@/lib/types/database';

export async function createOrganization(
  org: Omit<Orgs, 'id'>,
  tagNames: string[] = []
): Promise<Orgs> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError;

  const { data: createdOrg, error: orgError } = await supabase
    .from('orgs')
    .insert([org])
    .select()
    .single();

  if (orgError) throw orgError;

  const { error: memberError } = await supabase
    .from('org_members')
    .insert([{
      org_id: createdOrg.id,
      user_id: user.id,
      role: 'admin',
    }]);

  if (memberError) throw memberError;

  if (tagNames.length) {
    const tagRows = tagNames.map(tag => ({
      org_id: createdOrg.id,
      tag_name: tag,
    }));

    const { error: tagError } = await supabase
      .from('org_tags')
      .insert(tagRows);

    if (tagError) throw tagError;
  }

  return createdOrg;
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

  export async function upsertOrgMembers(
    org_id: string,
    members: Omit<OrgMember, 'org_id'>[]
  ): Promise<void> {
    const isAdmin = await isOrgAdmin(org_id);
    if (!isAdmin) throw new Error('Only admins can modify organization members');
  
    const upsertData = members.map(({ user_id, role }) => ({
      org_id,
      user_id,
      role,
    }));
  
    const { error } = await supabase
      .from('org_members')
      .upsert(upsertData); // Uses org_id + user_id as unique key
  
    if (error) {
      throw new Error(`Failed to upsert org members: ${error.message}`);
    }
  }

  export async function updateOrganization(
    id: string,
    org: Partial<Orgs>,
    tagNames?: string[]
  ): Promise<Orgs> {
    const isAdmin = await isOrgAdmin(id);
    if (!isAdmin) throw new Error('Only admins can update an organization');
    delete org.id; // Remove id from the update object
    const { data: updatedOrg, error: updateError } = await supabase
      .from('orgs')
      .update([org])
      .eq('id', id)
      .select()
      .single();
  
    if (updateError) throw updateError;
  
    if (tagNames) {
      const { error: deleteError } = await supabase
        .from('org_tags')
        .delete()
        .eq('org_id', id);
  
      if (deleteError) throw deleteError;
  
      if (tagNames.length) {
        const tagRows = tagNames.map(tag => ({
          org_id: id,
          tag_name: tag,
        }));
  
        const { error: insertError } = await supabase
          .from('org_tags')
          .insert(tagRows);
  
        if (insertError) throw insertError;
      }
    }
  
    return updatedOrg;
  }