"use client"; // Required because we use hooks

import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, Users, UserCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { AttendanceChart } from '@/components/attendance-chart';
import { RecentAbsencesTable } from '@/components/recent-absences-table';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

const DashboardPage: FC = () => {
    const { user, loading } = useAuth();
    const [stats, setStats] = React.useState<any>(null);
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [studentAttendance, setStudentAttendance] = useState<{ present: number; total: number } | null>(null);

    React.useEffect(() => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data));
    }, []);

    useEffect(() => {
      let url = '/api/attendance/summary';
      if (user?.role === 'student') {
        url += `?studentId=${user.id}`;
      }
      fetch(url)
        .then(res => res.json())
        .then(data => setAttendanceSummary(data));
    }, [user]);

    useEffect(() => {
      if (user?.role === 'student') {
        fetch(`/api/attendance?studentId=${user.id}`)
          .then(res => res.json())
          .then(data => {
            const total = data.length;
            const present = data.filter((rec: any) => rec.status === 'present').length;
            setStudentAttendance({ present, total });
          });
      }
    }, [user]);

    if (loading || !user || !stats) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <Skeleton className="h-8 w-48 mb-6" />
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                 </div>
                 <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 rounded-lg" />
                    <Skeleton className="h-64 rounded-lg" />
                 </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.name}! ({user.role})</p>

            {/* Stats Cards - Adjusted based on role */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Managed</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTeachers}</div>
                        <p className="text-xs text-muted-foreground">Faculty</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClasses}</div>
                        <p className="text-xs text-muted-foreground">Active</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.presentToday}</div>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{stats.absentToday}</div>
                        <p className="text-xs text-muted-foreground">Needs follow-up</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Tables - Conditionally render or adapt */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {user?.role === 'student' ? (
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>My Attendance Percentage</CardTitle>
                            <CardDescription>
                                Your overall attendance across all classes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {studentAttendance ? (
                                <div className="text-4xl font-bold text-primary">
                                    {studentAttendance.total > 0
                                        ? `${((studentAttendance.present / studentAttendance.total) * 100).toFixed(2)}%`
                                        : "N/A"}
                                </div>
                            ) : (
                                <Skeleton className="h-10 w-32" />
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                                {studentAttendance
                                    ? `${studentAttendance.present} out of ${studentAttendance.total} classes attended`
                                    : ""}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>Weekly Attendance Overview</CardTitle>
                            <CardDescription>Class attendance trends for the past 7 days.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceChart attendanceSummary={attendanceSummary} />
                        </CardContent>
                    </Card>
                )}
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>Recent Absence Explanations</CardTitle>
                            <CardDescription>Latest submissions needing review.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecentAbsencesTable userRole={user.role} userId={user.id} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
