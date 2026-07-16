import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  banSuperadminUser,
  setSuperadminUserPassword,
  superadminUsersInvalidateKey,
  updateSuperadminUserRole,
  type SuperadminUser,
} from '@/lib/api/superadmin'
import type { Role } from '@/lib/types/profile'

const ROLE_OPTIONS: Role[] = ['passenger', 'driver', 'admin', 'superadmin']

type ActionKind = 'role' | 'ban' | 'password' | null

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

type SuperadminUserActionsProps = {
  user: SuperadminUser
}

export function SuperadminUserActions({ user }: SuperadminUserActionsProps) {
  const queryClient = useQueryClient()
  const [action, setAction] = useState<ActionKind>(null)
  const [role, setRole] = useState<Role>(user.role)
  const [banReason, setBanReason] = useState(user.bannedReason ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: superadminUsersInvalidateKey })
  }

  const roleMutation = useMutation({
    mutationFn: () => updateSuperadminUserRole(user.id, role),
    onSuccess: async () => {
      setError(null)
      setAction(null)
      await invalidateUsers()
    },
    onError: (err) => setError(errorMessage(err, 'Failed to update role')),
  })

  const banMutation = useMutation({
    mutationFn: () =>
      banSuperadminUser(user.id, {
        isBanned: !user.isBanned,
        reason: user.isBanned ? null : banReason || null,
      }),
    onSuccess: async () => {
      setError(null)
      setAction(null)
      setBanReason('')
      await invalidateUsers()
    },
    onError: (err) =>
      setError(errorMessage(err, 'Failed to update ban status')),
  })

  const passwordMutation = useMutation({
    mutationFn: () => setSuperadminUserPassword(user.id, password),
    onSuccess: async () => {
      setError(null)
      setPassword('')
      setAction(null)
      await invalidateUsers()
    },
    onError: (err) =>
      setError(errorMessage(err, 'Failed to update password')),
  })

  const busy =
    roleMutation.isPending || banMutation.isPending || passwordMutation.isPending

  function openAction(next: ActionKind) {
    setError(null)
    setRole(user.role)
    setBanReason(user.bannedReason ?? '')
    setPassword('')
    setAction(next)
  }

  if (user.role === 'superadmin') {
    return null
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-8 rounded-full px-3 text-[12px] text-[#0066cc]"
          onClick={() => openAction('role')}
        >
          Role
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 rounded-full px-3 text-[12px] text-[#0066cc]"
          onClick={() => openAction('password')}
        >
          Password
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`h-8 rounded-full px-3 text-[12px] ${
            user.isBanned ? 'text-[#248a3d]' : 'text-[#b42318]'
          }`}
          onClick={() => openAction('ban')}
        >
          {user.isBanned ? 'Unban' : 'Ban'}
        </Button>
      </div>

      <AlertDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'role' && 'Change role'}
              {action === 'ban' && (user.isBanned ? 'Unban user' : 'Ban user')}
              {action === 'password' && 'Set password'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.fullName ?? user.email}
              {user.fullName ? ` · ${user.email}` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {action === 'role' && (
            <div className="space-y-2 py-2">
              <Label htmlFor="superadmin-user-role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  if (value) setRole(value as Role)
                }}
              >
                <SelectTrigger id="superadmin-user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'ban' && !user.isBanned && (
            <div className="space-y-2 py-2">
              <Label htmlFor="superadmin-ban-reason">Reason (optional)</Label>
              <Input
                id="superadmin-ban-reason"
                value={banReason}
                onChange={(event) => setBanReason(event.target.value)}
                placeholder="Violation of terms…"
                maxLength={500}
              />
            </div>
          )}

          {action === 'password' && (
            <div className="space-y-2 py-2">
              <Label htmlFor="superadmin-user-password">New password</Label>
              <Input
                id="superadmin-user-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b42318]">
              {error}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              className="h-10 rounded-full px-5 text-[14px]"
              disabled={
                busy ||
                (action === 'password' && password.length < 8) ||
                (action === 'role' && role === user.role)
              }
              onClick={() => {
                if (action === 'role') roleMutation.mutate()
                if (action === 'ban') banMutation.mutate()
                if (action === 'password') passwordMutation.mutate()
              }}
            >
              {busy ? 'Saving…' : 'Confirm'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
