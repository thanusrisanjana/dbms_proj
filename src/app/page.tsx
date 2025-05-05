import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect users to the login page by default
  redirect('/login');
  // Keep the return statement for safety, though redirect should prevent rendering
  return null;
}
