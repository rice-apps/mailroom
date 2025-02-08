import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ isAuthorized: false });
    }

    const { data: adminUser } = await supabase
      .from('users')
      .select('can_add_and_delete_packages')
      .eq('email', user.email)
      .single();

    const isAuthorized = adminUser?.can_add_and_delete_packages === true;
    return res.status(200).json({ isAuthorized });
  } catch (error) {
    console.error('Authorization check failed:', error);
    return res.status(500).json({ isAuthorized: false });
  }
}