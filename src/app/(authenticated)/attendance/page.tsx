'use client';

import type { FC } from 'react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Download, ListFilter, Search, Check, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useState, useEffect } from 'react';

type UserType = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  class?: string;
};

function getUTCMidnightISOString(date: Date) {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
}

// Simulate fetching students for a class (Teacher/Admin view)

const AttendancePage: FC = () => {
    const { user, loading } = useAuth();
    const [selectedClass, setSelectedClass] = React.useState<string | null>(user?.role === 'student' ? 'all' : null);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
    
    const [studentRecords, setStudentRecords] = React.useState<Array<{ date: Date; className: string; status: string; reason?: string }>>([]); // Student state
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState<"all" | "present" | "absent">("all");
    const [isFetchingStudents, setIsFetchingStudents] = React.useState(false);
     const [isFetchingRecords, setIsFetchingRecords] = React.useState(false);
    const [attendance, setAttendance] = React.useState<{ [studentId: string]: string }>({});
    const [attendanceLoading, setAttendanceLoading] = React.useState(false);
    const [classes, setClasses] = React.useState<any[]>([]);
    const [classesLoading, setClassesLoading] = React.useState(true);
    const [students, setStudents] = useState<UserType[]>([]);
    const [allAttendanceRecords, setAllAttendanceRecords] = useState<any[]>([]);
    const [showAllAttendance, setShowAllAttendance] = useState(false);

    // Fetch classes from API
    React.useEffect(() => {
        setClassesLoading(true);
        fetch('/api/classes')
            .then(res => res.json())
            .then(data => {
                setClasses(data);
                setClassesLoading(false);
            });
    }, []);

    const fetchAttendance = (classId: string, date: Date) => {
        setAttendanceLoading(true);
        fetch(`/api/attendance?classId=${classId}&date=${getUTCMidnightISOString(date)}`)
            .then(res => res.json())
            .then(data => {
                setAttendance(data);
                setAttendanceLoading(false);
            });
    };

    // Call fetchAttendance when class/date changes
    React.useEffect(() => {
        if (selectedClass && selectedDate) {
            fetchAttendance(selectedClass, selectedDate);
        }
    }, [selectedClass, selectedDate]);

    // Effect to fetch students when class/date changes (for Teacher/Admin)
    
     // Effect to fetch student's own records (for Student)
      

    useEffect(() => {
        if (selectedClass && selectedClass !== 'all') {
            fetch(`/api/students?classId=${selectedClass}`)
                .then(res => res.json())
                .then(data => setStudents(Array.isArray(data) ? data : []));
        } else if (selectedClass === 'all') {
            fetch(`/api/students`)
                .then(res => res.json())
                .then(data => setStudents(Array.isArray(data) ? data : []));
        } else {
            setStudents([]);
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedClass && selectedDate) {
            fetch(`/api/attendance?classId=${selectedClass}&date=${getUTCMidnightISOString(selectedDate)}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const att: { [studentId: string]: string } = {};
                        data.forEach((rec: any) => {
                            att[rec.student._id] = rec.status;
                        });
                        setAttendance(att);
                    } else {
                        setAttendance({});
                    }
                });
        }
    }, [selectedClass, selectedDate]);

    // In the student view section:
    useEffect(() => {
        if (user?.role === 'student' && selectedClass && selectedDate) {
            fetch(`/api/attendance?classId=${selectedClass}&date=${getUTCMidnightISOString(selectedDate)}`)
                .then(res => res.json())
                .then(data => {
                    const record = data.find((rec: any) => rec.student._id === user.id);
                    setStudentRecords(record ? [record] : []);
                });
        }
    }, [user, selectedClass, selectedDate]);

    // After fetching studentRecords (array of attendance records for the student)
    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter(r => r.status && r.status.toLowerCase() === 'present').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 'N/A';

    // --- Teacher/Admin Specific Handlers ---
    const handleAttendanceChange = (studentId: string, status: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const markAllPresent = () => {
        const allPresent: { [studentId: string]: string } = {};
        students.forEach(student => { allPresent[student._id] = 'present'; });
        setAttendance(allPresent);
    };

    const markAllAbsent = () => {
        const allAbsent: { [studentId: string]: string } = {};
        students.forEach(student => { allAbsent[student._id] = 'absent'; });
        setAttendance(allAbsent);
    };

    const filteredStudents =students.filter(student => {
        const nameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const status = attendance[student._id] || 'absent';
const statusMatch = filterStatus === 'all' || (filterStatus === 'present' && status === 'present') || (filterStatus === 'absent' && status === 'absent');
return nameMatch && statusMatch;
    });
    const presentCount = filteredStudents.filter(s => (attendance[s._id] || 'absent') === 'present').length;
    const absentCount = filteredStudents.length - presentCount;

    const handleSaveAttendance = async () => {
        const payload = {
            class: selectedClass,
            date: selectedDate,
            markedBy: user?.id,
            records: students.map(student => ({
                student: student._id,
                status: attendance[student._id] || 'absent',
            })),
        };
        console.log("Attendance payload:", payload);

        const res = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            alert('Attendance saved successfully!');
        } else {
            const error = await res.json();
            alert('Failed to save attendance: ' + (error.error || 'Unknown error'));
        }
    };

    const handleExport = () => {
        // Placeholder for CSV export
        console.log("Exporting attendance for class:", selectedClass, "on", selectedDate);
         alert("CSV export started (simulated).");
    }

     // --- Student Specific ---
     const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><Check className="mr-1 h-3 w-3" />Present</Badge>;
            case 'absent':
                return <Badge variant="destructive"><X className="mr-1 h-3 w-3" />Absent</Badge>;
             case 'pending':
                return <Badge variant="secondary">Pending Explanation</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Move this function here:
    const getStudentAttendanceRecord = (studentId: string, classId: string | null, date: Date) => {
        console.log(`Fetching attendance for student ${studentId}, class ${classId}, date ${format(date, 'yyyy-MM-dd')}`);
        // In real app, fetch based on studentId, classId, and date range/specific date
        // Return a list of attendance records for the student for the selected period/class
        // Example for a single date:
         if (classId === 'cls-1' && format(date, 'yyyy-MM-dd') === '2024-07-24') return { status: 'Present' };
         if (classId === 'cls-1' && format(date, 'yyyy-MM-dd') === '2024-07-23') return { status: 'Absent', reason: 'Doctor visit' };
         if (classId === 'cls-2' && format(date, 'yyyy-MM-dd') === '2024-07-24') return { status: 'Present' };
         // Simulate data for a range (e.g., last 7 days)
          const records = [];
          const today = new Date();
          for (let i = 0; i < 7; i++) {
            const loopDate = new Date(today);
            loopDate.setDate(today.getDate() - i);
            const dayOfWeek = loopDate.getDay(); // 0 = Sun, 6 = Sat
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

            let status: 'Present' | 'Absent' | 'Pending' = Math.random() > 0.2 ? 'Present' : 'Absent';
            let reason = status === 'Absent' ? (Math.random() > 0.5 ? 'Sick' : 'Family event') : undefined;
             if (status === 'Absent' && Math.random() > 0.7) {
                 status = 'Pending'; // Simulate pending explanation
                 reason = 'Explanation submitted';
             }

             // Only add if matches selected class or if no class is selected (overall view)
             const randomClassId = classes[Math.floor(Math.random() * classes.length)].id;
             if (!classId || classId === randomClassId) { // Check if classId is null (meaning 'all') or matches
                records.push({
                   id: `record-${i}`,
                   date: loopDate,
                   className: classes.find(c => c.id === randomClassId)?.name ?? 'Unknown Class',
                   status: status,
                   reason: reason
                });
              }
          }
          return records.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort descending

     // return null; // No record found
    };

    const fetchAllAttendanceRecords = async () => {
        if (!selectedClass) return;
        const res = await fetch(`/api/attendance?classId=${selectedClass}`);
        const data = await res.json();
        setAllAttendanceRecords(Array.isArray(data) ? data : []);
    };

    // --- Loading State ---
     if (loading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <Skeleton className="h-8 w-64 mb-4" />
                 <Skeleton className="h-40 rounded-lg" />
                 <Skeleton className="h-64 rounded-lg" />
            </div>
        );
     }

    if (classesLoading) {
        return <div>Loading classes...</div>;
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
             {user?.role === 'student' ? (
                 <h1 className="text-3xl font-bold text-primary">My Attendance Record</h1>
             ) : (
                 <h1 className="text-3xl font-bold text-primary">Attendance Management</h1>
             )}


            {/* Class and Date Selection - Common for All Roles */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Select {user?.role === 'student' ? 'View Options' : 'Class and Date'}</CardTitle>
                    <CardDescription>
                        {user?.role === 'student'
                            ? 'Select a class and date to view your attendance record.'
                            : 'Choose the class and date to record or view attendance.'
                         }
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Class</Label>
                            <Select
                                value={selectedClass || ''}
                                onValueChange={setSelectedClass}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate && !isNaN(new Date(selectedDate).getTime())
  ? format(selectedDate, "PPP")
  : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Student View */}
            {user?.role === 'student' && (
                <Card>
                    <CardHeader>
                        <CardTitle>My Attendance</CardTitle>
                        <CardDescription>
                            View your attendance record for the selected date and class
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reason</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentRecords.length > 0 ? (
    studentRecords.map((record, idx) => (
      <TableRow key={idx}>
        <TableCell>
          {selectedDate && !isNaN(new Date(selectedDate).getTime())
            ? format(new Date(selectedDate), "PPP")
            : "N/A"}
        </TableCell>
        <TableCell>{record.className}</TableCell>
        <TableCell>{getStatusBadge(record.status)}</TableCell>
        <TableCell>{record.reason || '-'}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={4} className="text-center text-muted-foreground">
        No attendance record found for the selected class and date.
      </TableCell>
    </TableRow>
  )}
                            </TableBody>
                        </Table>
                        
                    </CardContent>
                </Card>
            )}

            {/* Teacher/Admin View */}
            {(user?.role === 'teacher' || user?.role === 'admin') && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance List</CardTitle>
                            <CardDescription>
                                Mark attendance for the selected class and date
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={markAllPresent}>
                                        Mark All Present
                                    </Button>
                                    <Button variant="outline" onClick={markAllAbsent}>
                                        Mark All Absent
                                    </Button>
                                </div>
                                <Button onClick={handleSaveAttendance}>
                                    Save Attendance
                                </Button>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (!showAllAttendance) fetchAllAttendanceRecords();
                                setShowAllAttendance(!showAllAttendance);
                              }}
                            >
                              {showAllAttendance ? "Hide All Attendance Records" : "View All Attendance Records"}
                            </Button>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(student => (
                                        <TableRow key={student._id}>
                                            <TableCell>
                                                <Button
                                                    variant={attendance[student._id] === 'present' ? "default" : "outline"}
                                                    size="icon"
                                                    onClick={() => handleAttendanceChange(student._id, 'present')}
                                                    style={{ marginRight: 8 }}
                                                >
                                                    <Check color={attendance[student._id] === 'present' ? "white" : "green"} />
                                                </Button>
                                                <Button
                                                    variant={attendance[student._id] === 'absent' ? "destructive" : "outline"}
                                                    size="icon"
                                                    onClick={() => handleAttendanceChange(student._id, 'absent')}
                                                >
                                                    <X color={attendance[student._id] === 'absent' ? "white" : "red"} />
                                                </Button>
                                            </TableCell>
                                            <TableCell>{student.name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {showAllAttendance && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>All Attendance Records</CardTitle>
                                <CardDescription>
                                    All attendance records for the selected class.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allAttendanceRecords.length > 0 ? (
                                            allAttendanceRecords.map((rec, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        {selectedDate ? format(new Date(selectedDate), "PPP") : "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {rec.student?.name || "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {rec.status ? (
                                                            <Badge variant={rec.status === "present" ? "default" : "destructive"}>
                                                                {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                                                            </Badge>
                                                        ) : "N/A"}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                    No attendance records found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default AttendancePage;


    