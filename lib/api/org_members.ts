import { supabase } from '@/lib/supabase';
import type { Orgs, OrgMember } from '@/lib/types/database';
import {isOrgAdmin} from '@/lib/api/orgs';

export async function createOrgMember(role: string, user_id: string, org_id: string):  Promise<OrgMember> {
    const isAdmin = await isOrgAdmin(org_id);
    if(!isAdmin) throw new Error('Only Admins can add users');
    const {data: orgMember ,error: orgMemberError} = await supabase
    .from('org_members')
    .insert([{role, user_id, org_id}])
    .select()
    .single();

    if (orgMemberError) {
        console.error('Error creating org member:', orgMemberError);
        throw orgMemberError
    }
    return orgMember

}

//can only change role if admin
export async function updateOrgMember(org_id: string,user_id: string, updates: Partial<OrgMember>): Promise<OrgMember> {
    const isAdmin = await isOrgAdmin(org_id);
    if(!isAdmin) throw new Error('Only Admins can change user role');
    const {data: orgMember, error: orgMemberError} = await supabase
    .from('org_members')
    .update(updates)
    .select()
    .single();

    if(orgMemberError) {
        console.error('Error updating org member:', orgMemberError);
        throw orgMemberError;

    }
    return orgMember;

}

export async function getOrgMemberById(org_id: string, user_id: string): Promise<OrgMember> {
    const isAdmin = await isOrgAdmin(org_id);
    if(!isAdmin) throw new Error('Only Admins can change user role');
    const {data: orgMember, error: orgMemberError} = await supabase
    .from('org_members')
    .select()
    .eq('user_id', user_id)
    .single();

    if (orgMemberError) {
        console.error('Error fetching org member:', orgMemberError);
        throw orgMemberError
    }
    return orgMember;
    
}


export async function deleteOrgMember(org_id: string,user_id : string): Promise<boolean> {
    const isAdmin = await isOrgAdmin(org_id);
    if(!isAdmin) throw new Error('Only Admins can change user role');
    const { error: orgMemberError } = await supabase
      .from('org_members')
      .delete()
      .eq('user_id', user_id);
  
    if (orgMemberError) {
      console.error('Error deleting org member:', orgMemberError);
      return false;
    }
  
    return true;
  }

    



