'use server'

import { createClient } from "@/utils/supabase/server"

export async function fetchUser(email: string): Promise<any | null> {
  const supabase = createClient()
  console.log(email)

  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq('email', email)
      .single()
      console.log(data)

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}