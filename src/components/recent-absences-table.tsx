"use client";

import * as React from "react";
import { format } from "date-fns";
import { Eye, CheckCircle, XCircle, Paperclip } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UserRole } from "@/types/user";

// --- Placeholder Data & Fetching Simulation ---
// In a real app, this data would likely come from props or a context/store
// fetched based on the user's role and potentially ID in the parent component (Dashboard).


interface RecentAbsencesTableProps {
    userRole: UserRole;
    userId?: string; // Optional: only relevant for students
}

export function RecentAbsencesTable({ userRole, userId }: RecentAbsencesTableProps) {
    const [recentAbsences, setRecentAbsences] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        fetch('/api/absences')
            .then(res => res.json())
            .then(data => {
                setRecentAbsences(data);
                setLoading(false);
            });
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
        case 'pending':
            return <Badge variant="secondary">Pending</Badge>;
        case 'approved':
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
        }
    };

     // Simulate actions (in a real app, these would trigger API calls and potentially dialogs)
     const handleApprove = (id: string) => {
       if (window.confirm("Do you want to review this absence in detail? You will be taken to the Absence Explanations page.")) {
         window.location.href = "/absences";
         return;
       }
       // Optionally, you can still call the approve logic here if not navigating
     };
     const handleReject = (id: string) => {
       if (window.confirm("Do you want to review this absence in detail? You will be taken to the Absence Explanations page.")) {
         window.location.href = "/absences";
         return;
       }
       // Optionally, you can still call the reject logic here if not navigating
     };
     const handleViewDetails = (id: string) => alert(`Simulating VIEW DETAILS action for ID: ${id}`);


    if (loading) {
        return <div className="h-[300px] w-full flex items-center justify-center"><p>Loading recent absences...</p></div>;
    }

  return (
    <ScrollArea className="h-[300px] w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Show Student Name only for Teacher/Admin */}
            {(userRole === 'admin' || userRole === 'teacher') && <TableHead>Student</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            {/* Show Actions only for Teacher/Admin */}
            {(userRole === 'admin' || userRole === 'teacher') && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentAbsences.length > 0 ? recentAbsences.map((absence,idx) => (
            <TableRow key={absence._id || absence.id || idx}>
              {(userRole === 'admin' || userRole === 'teacher') && <TableCell className="font-medium">{absence.studentName}</TableCell>}
              <TableCell>
                {absence.date && !isNaN(new Date(absence.date).getTime())
                 ? format(new Date(absence.date), "MMM d, yyyy")
                 : "N/A"}
                  </TableCell>
              <TableCell className="max-w-[150px] truncate">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <span className="cursor-default">{absence.reason}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{absence.reason}</p>
                    </TooltipContent>
                  </Tooltip>
                  {absence.hasAttachment && (
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Paperclip className="inline-block ml-1 h-4 w-4 text-muted-foreground cursor-pointer"/>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Attachment included</p>
                          </TooltipContent>
                      </Tooltip>
                  )}
                </TooltipProvider>
              </TableCell>
              <TableCell>{getStatusBadge(absence.status)}</TableCell>
              {/* Show actions column only for Admin/Teacher */}
              {(userRole === 'admin' || userRole === 'teacher') && (
                <TableCell className="text-right space-x-1">
                  <TooltipProvider>
                      {/* View Details Action */}
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDetails(absence.id)}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>View Details</p>
                          </TooltipContent>
                      </Tooltip>
                      {/* Approve/Reject only if Pending */}
                      {absence.status === 'Pending' && (
                          <>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleApprove(absence.id)}>
                                          <CheckCircle className="h-4 w-4" />
                                          <span className="sr-only">Approve</span>
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>Approve</p>
                                  </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/90" onClick={() => handleReject(absence.id)}>
                                          <XCircle className="h-4 w-4" />
                                          <span className="sr-only">Reject</span>
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>Reject</p>
                                  </TooltipContent>
                              </Tooltip>
                          </>
                      )}
                  </TooltipProvider>
                </TableCell>
              )}
            </TableRow>
          )) : (
             <TableRow>
                <TableCell colSpan={(userRole === 'admin' || userRole === 'teacher') ? 5 : 4} className="h-24 text-center text-muted-foreground">
                    No recent absence submissions found.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
