'use server'

import { createClient } from "@/utils/supabase/server"
import { create } from "domain"

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
    //console.log(data)
    //console.log("success")
    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function fetchPackagesbyUser(email:string): Promise<any | null> {
  const supabase = createClient()

  try {
    const { data,error} = await supabase
      .from('packages')
      .select()
      .eq('email',email) //TODO: change to filter by uuid
      .eq('claimed',false)
    if (error) {
      console.error("error fetching packages")
      return null
    }

    console.log("hello from here")
    
    return data
  } catch (error) {
    console.error("Unexpected error:",error)
    return null
  }
}

export async function claimPackage(id:string): Promise<boolean | undefined> {
  const supabase = createClient()

  try {
    const {error} = await supabase
    .from("packages")
    .update({claimed: "true"})
    .eq('id',id)
    if (error) {
      console.error(`error claiming package with id ${id}`)
      return false
    }
    console.log("success???")
    return true
  } catch (error) {
      console.error(`error claiming package with id ${id}`)
      return false
  }
}