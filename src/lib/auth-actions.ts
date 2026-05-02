import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // We store the intended role in user_metadata
      data: {
        role: email.toLowerCase() === process.env.MASTER_ADMIN_EMAIL?.toLowerCase() ? 'ADMIN' : 'CUSTOMER'
      }
    }
  });

  if (error) return redirect('/auth?error=' + error.message);
  return redirect('/auth?message=Check email to confirm registration');
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return redirect('/auth?error=' + error.message);

  // Check if this user is the Master Admin and update their role if the ENV changed
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase();
  if (email.toLowerCase() === masterEmail) {
    // Force administrative access in the session/metadata
    await supabase.auth.updateUser({
      data: { role: 'ADMIN' }
    });
  }

  return redirect('/');
}
