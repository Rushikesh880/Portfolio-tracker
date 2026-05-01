'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function handleSignup(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirm_password')

  if (password !== confirmPassword) {
    return redirect('/signup?error=Passwords do not match')
  }

  const supabase = await createClient()

  const data = { email, password }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/signup?error=' + error.message)
  }

  // Check if session is null (which means email confirmation is required by Supabase)
  if (authData.user && authData.session === null) {
    return redirect('/login?error=Registration successful! Please check your email to confirm your account.')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
