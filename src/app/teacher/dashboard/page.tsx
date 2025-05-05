"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      {/* Add teacher-specific content here */}
    </div>
  );
} 