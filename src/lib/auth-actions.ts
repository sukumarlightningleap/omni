"use server"

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password
  });

  if (error) {
    return redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  // Master Admin Check: If the email matches your Vercel ENV,
  // ensure the metadata reflects ADMIN status.
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
  if (email.toLowerCase().trim() === masterEmail) {
    await supabase.auth.updateUser({
      data: { role: 'ADMIN' }
    });
  }

  return redirect('/admin/products');
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: {
        full_name: name,
        role: email.toLowerCase().trim() === process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim() ? 'ADMIN' : 'CUSTOMER'
      }
    }
  });

  if (error) {
    return redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/auth?message=Verification email sent. Please check your inbox.');
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  return redirect('/auth');
}
