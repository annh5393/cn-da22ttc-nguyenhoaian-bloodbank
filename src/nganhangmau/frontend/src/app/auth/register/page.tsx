import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Redirect permanently to unified account auth flow
  redirect('/auth/account');
}
