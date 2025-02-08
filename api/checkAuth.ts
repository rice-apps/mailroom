'use server'

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function checkAuth(): Promise<any | null> {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // return res.status(401).json({ isAuthorized: false });
      console.log("No User")
      return null
    }

    const { data: adminUser } = await supabase
      .from('users')
      .select('can_add_and_delete_packages')
      .eq('email', user.email)
      .single();

    const isAuthorized = adminUser?.can_add_and_delete_packages === true;
    return isAuthorized;
  } catch (error) {
    console.error('Authorization check failed:', error);
    return false;
  }
}