import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect permanently to unified account auth flow
  redirect('/auth/account');
}
