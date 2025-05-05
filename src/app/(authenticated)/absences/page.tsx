'use client';

import type { FC } from 'react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload, FileText, CheckCircle, XCircle, Eye, Paperclip, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Dialog components


// --- Placeholder Data & Fetching Simulation ---

// Simulate fetching absence submissions (can be filtered by student ID or fetch all for Teacher/Admin)
const fetchAbsenceSubmissions = async (role: 'admin' | 'teacher' | 'student', userId?: string) => {
    try {
        const response = await fetch('/api/absences');
        if (!response.ok) throw new Error('Failed to fetch absences');
        const data = await response.json();
        // Map _id to id for React and update logic
        const mapped = data.map((item: any) => ({
            ...item,
            id: item._id || item.id,
        }));
        if (role === 'student' && userId) {
            return mapped.filter((sub: any) => sub.student._id === userId);
        }
        return mapped;
    } catch (error) {
        console.error('Error fetching absences:', error);
        return [];
    }
};

// Simulate API call to submit absence
const submitAbsenceExplanation = async (data: { date: Date; reason: string; attachment?: File | null, studentId: string, studentName: string }): Promise<{ success: boolean; message: string }> => {
    try {
        const formData = new FormData();
        formData.append('date', data.date.toISOString());
        formData.append('reason', data.reason);
        formData.append('studentId', data.studentId);
        formData.append('studentName', data.studentName);
        if (data.attachment) {
            formData.append('file', data.attachment);
        }

        const response = await fetch('/api/absences/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit absence');
        }

        const result = await response.json();
        return { success: true, message: result.message };
    } catch (error) {
        console.error('Error submitting absence:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Failed to submit absence' };
    }
};

// Simulate API call to update absence status (Approve/Reject)
const updateAbsenceStatus = async (submissionId: string, status: 'Approved' | 'Rejected', comment: string): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`/api/absences/${submissionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, comment }),
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating status:', error);
        return { success: false };
    }
};


const AbsencesPage: FC = () => {
    const { user, loading } = useAuth();
    const [absenceDate, setAbsenceDate] = React.useState<Date | undefined>();
    const [reason, setReason] = React.useState('');
    const [attachment, setAttachment] = React.useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [submissions, setSubmissions] = React.useState<Array<any>>([]);
    const [isFetchingSubmissions, setIsFetchingSubmissions] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
     const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);
     const [selectedSubmission, setSelectedSubmission] = React.useState<any>(null);
      const [rejectionComment, setRejectionComment] = React.useState('');
      const [showRejectionDialog, setShowRejectionDialog] = React.useState(false);


    // Fetch submissions on mount and when user changes
    React.useEffect(() => {
        if (user) {
            setIsFetchingSubmissions(true);
            fetchAbsenceSubmissions(user.role, user.id)
                .then(fetchedData => {
                    setSubmissions(fetchedData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                    setIsFetchingSubmissions(false);
                })
                .catch(error => {
                    console.error('Error fetching submissions:', error);
                    setIsFetchingSubmissions(false);
                });
        }
    }, [user]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            // Basic validation (optional)
            const file = event.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                 toast({ title: "File Too Large", description: "Maximum file size is 5MB.", variant: "destructive" });
                 setAttachment(null);
                 if (fileInputRef.current) fileInputRef.current.value = '';
                 return;
             }
             // Add more type checks if needed
             setAttachment(file);
        } else {
            setAttachment(null);
        }
    };

    const handleSubmitAbsence = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || user.role !== 'student') return;

        if (!absenceDate || !reason) {
            toast({ title: "Missing Information", description: "Please select a date and provide a reason.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const result = await submitAbsenceExplanation({
            date: absenceDate,
            reason,
            attachment,
            studentId: user.id,
            studentName: user.name,
        });
        setIsSubmitting(false);

        if (result.success) {
            toast({ title: "Absence Submitted", description: result.message });
            // Refetch submissions to get the latest data
            const fetchedData = await fetchAbsenceSubmissions(user.role, user.id);
            setSubmissions(fetchedData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            // Reset form
            setAbsenceDate(undefined);
            setReason('');
            setAttachment(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            toast({ title: "Submission Failed", description: result.message, variant: "destructive" });
        }
    };

     // --- Teacher/Admin Actions ---
     const handleViewDetails = (submission: any) => {
        setSelectedSubmission(submission);
        setShowDetailsDialog(true);
     };

      const handleApprove = async (submissionId: string) => {
        const success = await updateAbsenceStatus(submissionId, 'Approved', 'Approved by Teacher/Admin.');
        if (success) {
            toast({ title: "Submission Approved", description: `Absence request ${submissionId} marked as approved.` });
            // Update local state
            setSubmissions(subs => subs.map(s => s.id === submissionId ? { ...s, status: 'Approved', comment: 'Approved by Teacher/Admin.' } : s));
        } else {
             toast({ title: "Action Failed", description: "Could not approve the submission.", variant: "destructive" });
        }
     };

      const handleReject = async (submissionId: string) => {
         // Open rejection comment dialog
          setSelectedSubmission(submissions.find(s => s.id === submissionId));
          setRejectionComment(''); // Clear previous comment
          setShowRejectionDialog(true);
     };

      const confirmReject = async () => {
         if (!selectedSubmission || !rejectionComment) {
             toast({ title: "Comment Required", description: "Please provide a reason for rejection.", variant: "destructive" });
             return;
         }
         const success = await updateAbsenceStatus(selectedSubmission.id, 'Rejected', rejectionComment);
         setShowRejectionDialog(false); // Close dialog first

         if (success) {
            toast({ title: "Submission Rejected", description: `Absence request ${selectedSubmission.id} marked as rejected.` });
            // Update local state
             setSubmissions(subs => subs.map(s => s.id === selectedSubmission.id ? { ...s, status: 'Rejected', comment: rejectionComment } : s));
             setSelectedSubmission(null); // Clear selection
         } else {
             toast({ title: "Action Failed", description: "Could not reject the submission.", variant: "destructive" });
         }
      };


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

    // --- Loading State ---
     if (loading || !user) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                 <Skeleton className="h-8 w-64 mb-4" />
                {/* Simulate structure based on potential role */}
                 <Skeleton className="h-64 rounded-lg" /> {/* Submission form or Table header */}
                 <Skeleton className="h-80 rounded-lg" /> {/* Table */}
            </div>
        );
     }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <h1 className="text-3xl font-bold text-primary">
                 {user.role === 'student' ? 'My Absence Explanations' : 'Absence Explanations Management'}
            </h1>

             {/* Submission Form - Only for Students */}
             {user.role === 'student' && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Submit Absence Explanation</CardTitle>
                        <CardDescription>Explain your absence and attach any relevant documents (max 5MB).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitAbsence} className="space-y-4">
                             <div>
                                <Label htmlFor="absence-date">Date of Absence</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        id="absence-date"
                                        variant={"outline"}
                                        className="w-full justify-start text-left font-normal mt-1"
                                        disabled={isSubmitting}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {absenceDate ? format(absenceDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={absenceDate}
                                        onSelect={setAbsenceDate}
                                        initialFocus
                                        disabled={isSubmitting}
                                    />
                                    </PopoverContent>
                                </Popover>
                             </div>

                            <div>
                                <Label htmlFor="reason">Reason for Absence</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Please provide a detailed reason..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <Label htmlFor="attachment">Attach Document (Optional)</Label>
                                <div className="flex items-center gap-2 mt-1">
                                     <Input
                                        id="attachment"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Specify accepted types
                                        disabled={isSubmitting}
                                    />
                                     <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                                        <Upload className="mr-2 h-4 w-4"/> Choose File
                                    </Button>
                                    {attachment && (
                                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                            {attachment.name}
                                         </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Allowed: PDF, DOC(X), JPG, PNG. Max: 5MB.</p>
                            </div>

                            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : (
                                     <>
                                        <FileText className="mr-2 h-4 w-4" /> Submit Explanation
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}


            {/* Review Table / Student History Table */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>{user.role === 'student' ? 'My Submission History' : 'Review Absence Submissions'}</CardTitle>
                     <CardDescription>
                         {user.role === 'student' ? 'Track the status of your explanations.' : 'Approve or reject student absence explanations.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="max-h-[60vh] w-full">
                         {isFetchingSubmissions ? (
                            <div className="space-y-2 p-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                         ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                         {/* Show Student Name only for Teacher/Admin */}
                                        {(user.role === 'admin' || user.role === 'teacher') && <TableHead>Student</TableHead>}
                                        <TableHead>Date</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Comment/Note</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.length > 0 ? submissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            {(user.role === 'admin' || user.role === 'teacher') && <TableCell className="font-medium">{submission.studentName}</TableCell>}
                                            <TableCell>{format(submission.date, "MMM d, yyyy")}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                <TooltipProvider delayDuration={100}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                        <span className="cursor-default">{submission.reason}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>{submission.reason}</p></TooltipContent>
                                                    </Tooltip>
                                                     {submission.attachment && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="ml-1 h-5 w-5 p-0 inline-flex items-center justify-center align-middle"
                                                                    onClick={() => window.open(`/uploads/${submission.attachment}`, '_blank')}
                                                                >
                                                                    <Paperclip className="h-4 w-4 text-muted-foreground"/>
                                                                    <span className="sr-only">View attachment {submission.attachment}</span>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>View: {submission.attachment}</p></TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                             <TableCell className="max-w-[150px] truncate text-muted-foreground italic">
                                                  <TooltipProvider delayDuration={100}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-default">{submission.comment || (submission.status !== 'Pending' ? 'N/A' : '')}</span>
                                                        </TooltipTrigger>
                                                        {submission.comment && <TooltipContent><p>{submission.comment}</p></TooltipContent>}
                                                    </Tooltip>
                                                </TooltipProvider>
                                             </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <TooltipProvider delayDuration={100}>
                                                    {/* View Details - Always Available */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDetails(submission)}>
                                                                <Eye className="h-4 w-4" />
                                                                <span className="sr-only">View Details</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>View Details</p></TooltipContent>
                                                    </Tooltip>

                                                    {/* Approve/Reject Actions - Teacher/Admin & Pending Only */}
                                                     {(user.role === 'admin' || user.role === 'teacher') && submission.status === 'Pending' && (
                                                        <>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                     <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleApprove(submission.id)}>
                                                                        <CheckCircle className="h-4 w-4" />
                                                                         <span className="sr-only">Approve</span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                 <TooltipContent><p>Approve</p></TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/90" onClick={() => handleReject(submission.id)}>
                                                                        <XCircle className="h-4 w-4" />
                                                                        <span className="sr-only">Reject</span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                 <TooltipContent><p>Reject</p></TooltipContent>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                         <TableRow>
                                             <TableCell colSpan={(user.role === 'admin' || user.role === 'teacher') ? 6 : 5} className="text-center h-24 text-muted-foreground">
                                                No absence submissions found.
                                             </TableCell>
                                         </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         )}
                     </ScrollArea>
                </CardContent>
            </Card>

             {/* Details Dialog */}
              <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Absence Details</DialogTitle>
                         <DialogDescription>
                             Review the full details of the absence explanation.
                         </DialogDescription>
                    </DialogHeader>
                     {selectedSubmission && (
                        <div className="space-y-3 py-4 text-sm">
                            <p><strong>Student:</strong> {selectedSubmission.studentName}</p>
                            <p><strong>Date:</strong> {format(selectedSubmission.date, "PPP")}</p>
                            <p><strong>Status:</strong> {getStatusBadge(selectedSubmission.status)}</p>
                            <p><strong>Reason:</strong></p>
                            <p className="pl-2 whitespace-pre-wrap">{selectedSubmission.reason}</p>
                             {selectedSubmission.comment && (
                                 <>
                                     <p><strong>Comment:</strong></p>
                                     <p className="pl-2 italic text-muted-foreground">{selectedSubmission.comment}</p>
                                 </>
                             )}
                             <p><strong>Attachment:</strong> {selectedSubmission.attachment ? (
                                 <Button variant="link" size="sm" className="p-0 h-auto ml-1" onClick={() => window.open(`/uploads/${selectedSubmission.attachment}`, '_blank')}>
                                     {selectedSubmission.attachment} <Paperclip className="ml-1 h-3 w-3"/>
                                 </Button>
                             ) : 'None'}</p>

                         </div>
                     )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/* Rejection Comment Dialog */}
              <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Reject Submission?</AlertDialogTitle>
                    <AlertDialogDescription>
                         Please provide a brief reason for rejecting this absence explanation. This comment will be visible to the student.
                     </AlertDialogDescription>
                    </AlertDialogHeader>
                     <Textarea
                        placeholder="Enter rejection reason..."
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                        className="mt-2"
                     />
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedSubmission(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmReject} disabled={!rejectionComment.trim()}>Confirm Rejection</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>

        </div>
    );
};

export default AbsencesPage;
