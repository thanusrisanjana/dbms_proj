'use client';

import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [allClasses, setAllClasses] = useState<any[]>([]);

  // Fetch profile from API
  useEffect(() => {
    if (user) {
      fetch(`/api/profile?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setForm(data);
        });
    }
  }, [user]);

  useEffect(() => {
    // Fetch all classes for the dropdown
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => setAllClasses(data));
  }, []);

  if (loading || !profile) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle form changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle emergency contact changes
  const handleEmergencyChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value,
      }
    }));
  };

  // Handle classes (comma separated)
  const handleClassesChange = (e: any) => {
    setForm((prev: any) => ({
      ...prev,
      currentClasses: e.target.value.split(',').map((c: string) => c.trim()),
    }));
  };

  // Save profile
  const handleSave = async () => {
    if(!user) return;
    setIsSaving(true);
    const res = await fetch(`/api/profile?userId=${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
    }
    setIsSaving(false);
  };
  console.log('Profile classes:', profile.classes);
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              <Badge variant="outline" className="mt-1">{profile.role}</Badge>
            </div>
            {!editMode && (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {editMode ? (
            <>
              <div>
                <Label>Enrollment Date</Label>
                <Input
                  type="date"
                  name="enrollmentDate"
                  value={form.enrollmentDate ? format(new Date(form.enrollmentDate), 'yyyy-MM-dd') : ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Declared Major</Label>
                <Input
                  name="major"
                  value={form.major || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Currently Enrolled Classes</Label>
                <select
                  multiple
                  value={form.classes ? form.classes.map((cls: any) => typeof cls === 'string' ? cls : cls._id) : []}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setForm((prev: any) => ({
                      ...prev,
                      classes: selected,
                    }));
                  }}
                  className="w-full border rounded p-2"
                >
                  {allClasses.map((cls: any) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Emergency Contact Name</Label>
                <Input
                  name="name"
                  value={form.emergencyContact?.name || ''}
                  onChange={handleEmergencyChange}
                />
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={form.emergencyContact?.phone || ''}
                  onChange={handleEmergencyChange}
                />
                <Label>Relationship</Label>
                <Input
                  name="relationship"
                  value={form.emergencyContact?.relationship || ''}
                  onChange={handleEmergencyChange}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Enrollment Date</Label>
                <p>{profile.enrollmentDate ? format(new Date(profile.enrollmentDate), 'PPP') : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Declared Major</Label>
                <p>{profile.major || 'Undeclared'}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Currently Enrolled Classes</Label>
                <ul className="list-disc list-inside mt-1 space-y-1">
                {profile.classes && profile.classes.length > 0 ? (
    profile.classes.map((cls: any) => <li key={cls._id}>{cls.name}</li>)
  ) : (
    <li className="text-muted-foreground italic">No classes enrolled.</li>
    
  )}
                </ul>
              </div>
              <Card className="bg-secondary p-4">
                <CardTitle className="text-lg mb-2">Emergency Contact</CardTitle>
                {profile.emergencyContact ? (
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {profile.emergencyContact.name}</p>
                    <p><strong>Phone:</strong> {profile.emergencyContact.phone}</p>
                    <p><strong>Relationship:</strong> {profile.emergencyContact.relationship}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No emergency contact information available.</p>
                )}
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;