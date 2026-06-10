import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  fetchPendingDriverApplications,
  pendingApplicationsQueryKey,
  reviewDriverApplication,
} from '@/lib/api/profile'
import { requireRole } from '@/lib/route-guards'

export const Route = createFileRoute('/admin/drivers')({
  beforeLoad: async () => {
    await requireRole('/admin/drivers', 'admin')
  },
  component: AdminDriversPage,
})

function AdminDriversPage() {
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const applicationsQuery = useQuery({
    queryKey: pendingApplicationsQueryKey,
    queryFn: fetchPendingDriverApplications,
  })

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminNotes,
    }: {
      id: string
      status: 'approved' | 'rejected'
      adminNotes?: string
    }) => reviewDriverApplication(id, { status, adminNotes }),
    onSuccess: async () => {
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: pendingApplicationsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    },
    onError: () => {
      setActionError('Failed to update application. Please try again.')
    },
  })

  const applications = applicationsQuery.data ?? []

  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Driver approvals
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review and approve driver registration requests. Only admins can grant
            driver access.
          </p>
        </div>

        {actionError && (
          <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionError}
          </p>
        )}

        <div className="mt-10 space-y-4">
          {applicationsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading applications...</p>
          ) : applications.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">No pending applications</CardTitle>
                <CardDescription>
                  New driver registrations will appear here for your review.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {application.applicant.fullName ?? application.applicant.email}
                  </CardTitle>
                  <CardDescription>
                    {application.applicant.email}
                    {application.applicant.phone
                      ? ` · ${application.applicant.phone}`
                      : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>License: {application.licenseNo}</p>
                    {application.vehicleInfo && (
                      <p>Vehicle: {application.vehicleInfo}</p>
                    )}
                    <p>
                      Applied:{' '}
                      {new Date(application.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <label className="block">
                    <span className="text-xs font-medium text-muted-foreground">
                      Admin notes (optional)
                    </span>
                    <textarea
                      value={notes[application.id] ?? ''}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [application.id]: event.target.value,
                        }))
                      }
                      placeholder="Notes for the applicant..."
                      rows={2}
                      className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <div className="flex gap-3">
                    <Button
                      disabled={reviewMutation.isPending}
                      onClick={() =>
                        reviewMutation.mutate({
                          id: application.id,
                          status: 'approved',
                          adminNotes: notes[application.id] || undefined,
                        })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      disabled={reviewMutation.isPending}
                      onClick={() =>
                        reviewMutation.mutate({
                          id: application.id,
                          status: 'rejected',
                          adminNotes: notes[application.id] || undefined,
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
