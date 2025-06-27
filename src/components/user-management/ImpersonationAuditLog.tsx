import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle,
  FileText,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ImpersonationLog {
  id: string;
  admin_user_id: string;
  target_user_id: string;
  action: 'start_impersonation' | 'end_impersonation';
  started_at: string;
  ended_at?: string;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  created_at: string;
  admin_user?: {
    full_name: string;
    email: string;
  };
  target_user?: {
    full_name: string;
    email: string;
  };
}

export function ImpersonationAuditLog() {
  const [logs, setLogs] = useState<ImpersonationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { hasRole } = useAuth();

  // Only super admins can view audit logs
  if (!hasRole('super_admin')) {
    return null;
  }

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // First get the logs
      const { data: logsData, error: logsError } = await supabase
        .from('user_impersonation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) {
        console.error('Error fetching audit logs:', logsError);
        toast.error('Failed to load audit logs');
        return;
      }

      // Then get user details for each log
      const logsWithUsers = await Promise.all(
        (logsData || []).map(async (log) => {
          const [adminUser, targetUser] = await Promise.all([
            supabase
              .from('user_profiles')
              .select('full_name, email')
              .eq('id', log.admin_user_id)
              .single(),
            supabase
              .from('user_profiles')
              .select('full_name, email')
              .eq('id', log.target_user_id)
              .single()
          ]);

          return {
            ...log,
            admin_user: adminUser.data,
            target_user: targetUser.data
          };
        })
      );

      setLogs(logsWithUsers);
    } catch (error) {
      console.error('Error in fetchAuditLogs:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.admin_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter === '' || 
      log.created_at.startsWith(dateFilter);

    return matchesSearch && matchesDate;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'Ongoing';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'start_impersonation':
        return <Badge variant="destructive">Started</Badge>;
      case 'end_impersonation':
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Admin User', 'Target User', 'Action', 'Duration', 'Reason', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        formatDateTime(log.created_at),
        log.admin_user?.full_name || 'Unknown',
        log.target_user?.full_name || 'Unknown',
        log.action,
        formatDuration(log.started_at, log.ended_at),
        log.reason || '',
        log.ip_address || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impersonation-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Audit Log
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            User Impersonation Audit Log
          </DialogTitle>
          <DialogDescription>
            Complete audit trail of all user impersonation activities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by user name, email, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="date">Date Filter</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={fetchAuditLogs} variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportLogs} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} records
          </div>

          {/* Audit Log Table */}
          <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Admin User</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {formatDateTime(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.admin_user?.full_name}</div>
                          <div className="text-xs text-gray-500">{log.admin_user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.target_user?.full_name}</div>
                          <div className="text-xs text-gray-500">{log.target_user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        {formatDuration(log.started_at, log.ended_at)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.reason || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
