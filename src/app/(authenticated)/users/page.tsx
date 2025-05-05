'use client';

import type { FC } from 'react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Removed unused Radio imports
import { MoreHorizontal, Pencil, Trash2, PlusCircle, Search, UserPlus, ShieldCheck, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useEffect, useState } from 'react';

type UserType = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const roles = ['Admin', 'Teacher', 'Student'];

const UsersPage: FC = () => {
    const { user, loading } = useAuth(); // Use auth hook
    const [users, setUsers] = useState<UserType[]>([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);
    const [isEditUserDialogOpen, setIsEditUserDialogOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<UserType | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false); // For form submissions

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    const handleEditUserClick = (userToEdit: UserType) => {
        setEditingUser(userToEdit);
        setIsEditUserDialogOpen(true);
    };

    // Add user form handling (simplified) - Admin only
    const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (user?.role !== 'admin') return;
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const newUser = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: (formData.get('role') as string).toLowerCase(),
            status: 'Active',
            password: formData.get('password') as string,
        };
        // Send to backend API
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });
        if (res.ok) {
            const created = await res.json();
            setUsers([...users, created]);
        }
        setIsSubmitting(false);
        setIsAddUserDialogOpen(false);
    };

    // Edit user form handling (simplified) - Admin only
     const handleEditUser = (event: React.FormEvent<HTMLFormElement>) => {
         event.preventDefault();
         if (!editingUser || user?.role !== 'admin') return;
         setIsSubmitting(true);

         const formData = new FormData(event.currentTarget);
         const updatedUser = {
             ...editingUser,
             name: formData.get('name') as string,
             email: formData.get('email') as string,
             role: formData.get('role') as string, // Role can be edited
             status: formData.get('status') as string, // Status can be edited
         };

         // Simulate API call
        setTimeout(() => {
             console.log("Updating user:", updatedUser);
            setUsers(users.map(u => u._id === editingUser._id ? updatedUser : u));
             setIsSubmitting(false);
             setIsEditUserDialogOpen(false);
             setEditingUser(null);
         }, 500);
    };

    const handleDeleteUser = (userId: string) => {
         if (user?.role !== 'admin') return;
         const userToDelete = users.find(u => u._id === userId);
         if (userToDelete?.role === 'Admin') {
             alert("Cannot delete the primary Admin user (simulated).");
             return;
         }
         if (window.confirm(`Are you sure you want to delete user ${userToDelete?.name}?`)) {
            // Simulate API call
             setTimeout(() => {
                console.log("Deleting user:", userId);
                setUsers(users.filter(u => u._id !== userId));
             }, 300);
         }
    };

     const filteredUsers = users.filter(u => {
        const nameMatch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
        // Add role filter if needed
        return nameMatch || emailMatch;
    });

    const getRoleBadge = (role: string | undefined) => {
        if (!role) return <Badge variant="secondary">Unknown</Badge>;
        switch (role.toLowerCase()) {
        case 'admin':
            return <Badge variant="destructive"><ShieldCheck className="mr-1 h-3 w-3"/>Admin</Badge>;
        case 'teacher':
            return <Badge variant="secondary">Teacher</Badge>;
        case 'student':
            return <Badge variant="outline">Student</Badge>;
        default:
            return <Badge>{role}</Badge>;
        }
    };

    // --- Loading and Access Control ---
     if (loading) {
         return (
            <div className="container mx-auto py-6 space-y-6">
                <Skeleton className="h-8 w-64 mb-4" />
                 <Skeleton className="h-12 w-full mb-4" />
                 <Skeleton className="h-96 rounded-lg" />
            </div>
        );
     }

     // Enforce Admin-only access
     if (user?.role !== 'admin') {
         return (
             <div className="container mx-auto py-6 text-center">
                <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-semibold">Access Denied</h1>
                <p className="text-muted-foreground">Only Administrators can manage users.</p>
            </div>
         );
     }


    return (
        <div className="container mx-auto py-6 space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">User Management</h1>
                    <p className="text-muted-foreground">Manage system users and their roles (Admin Access Only).</p>
                </div>
                 <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                         <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <UserPlus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>Enter details for the new system user.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="add-user-name" className="text-right">Name</Label>
                                <Input id="add-user-name" name="name" className="col-span-3" required disabled={isSubmitting}/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="add-user-email" className="text-right">Email</Label>
                                <Input id="add-user-email" name="email" type="email" className="col-span-3" required disabled={isSubmitting}/>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="add-user-password" className="text-right">Password</Label>
                                <Input id="add-user-password" name="password" type="password" className="col-span-3" required disabled={isSubmitting}/>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="add-user-role" className="text-right">Role</Label>
                                <Select name="role" required disabled={isSubmitting}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Add password field if creating users directly */}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Adding...' : 'Add User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                 <Dialog open={isEditUserDialogOpen} onOpenChange={(open) => {setIsEditUserDialogOpen(open); if (!open) setEditingUser(null);}}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user details and role.</DialogDescription>
                        </DialogHeader>
                         <form onSubmit={handleEditUser} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-user-name" className="text-right">Name</Label>
                                <Input id="edit-user-name" name="name" defaultValue={editingUser?.name} className="col-span-3" required disabled={isSubmitting}/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-user-email" className="text-right">Email</Label>
                                <Input id="edit-user-email" name="email" type="email" defaultValue={editingUser?.email} className="col-span-3" required disabled={isSubmitting}/>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-user-role" className="text-right">Role</Label>
                                <Select name="role" defaultValue={editingUser?.role} required disabled={isSubmitting || editingUser?.role === 'Admin'}>
                                    <SelectTrigger className="col-span-3" disabled={editingUser?.role === 'Admin'}>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role} disabled={role === 'Admin' && editingUser?.role !== 'Admin'}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editingUser?.role === 'Admin' && <p className="col-span-4 text-xs text-muted-foreground text-right pt-1">Admin role cannot be changed.</p>}
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-user-status" className="text-right">Status</Label>
                                <Select name="status" defaultValue={editingUser?.status} required disabled={isSubmitting || editingUser?.role === 'Admin'}>
                                    <SelectTrigger className="col-span-3" disabled={editingUser?.role === 'Admin'}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                 {editingUser?.role === 'Admin' && <p className="col-span-4 text-xs text-muted-foreground text-right pt-1">Admin status cannot be changed.</p>}
                            </div>
                            {/* Add password reset option if needed */}
                             <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                     {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                 </Dialog>
            </div>


            <Card className="shadow-sm">
                 <CardHeader>
                    <CardTitle>User List</CardTitle>
                     <div className="relative mt-4 w-full md:w-1/3">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users by name or email..."
                            className="w-full rounded-lg bg-background pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="max-h-[60vh] w-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                    <TableRow key={u._id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.status === 'Active' ? 'default' : 'secondary'} className={u.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                {u.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={u.role === 'Admin' && u._id === user?.id}> {/* Prevent actions on self if admin */}
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEditUserClick(u)} disabled={u.role === 'Admin'}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        disabled={u.role === 'Admin'} // Prevent deleting admin
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                     </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default UsersPage;
