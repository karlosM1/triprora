import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
  cancelDelivery,
  deliveryQueryOptions,
  historyDeliveriesQueryKey,
  historyDeliveriesQueryOptions,
  upcomingDeliveriesQueryKey,
  upcomingDeliveriesQueryOptions,
} from "@/lib/api/deliveries";
import { queryClient } from "@/lib/query-client";
import type { DeliveryListItem } from "@/lib/types/api";

export const Route = createFileRoute("/my-deliveries/")({
  loader: () => {
    // Warm the cache without blocking the route — sections render independently.
    void queryClient.prefetchQuery(upcomingDeliveriesQueryOptions());
    void queryClient.prefetchQuery(historyDeliveriesQueryOptions());
  },
  component: MyDeliveriesPage,
});

function statusLabel(delivery: DeliveryListItem) {
  switch (delivery.status) {
    case "pending":
      return "Awaiting driver";
    case "accepted":
      return "Accepted — pay now";
    case "confirmed":
      if (delivery.isPaid) return "Paid";
      if (delivery.paymentMethod === "cash") return "Confirmed — cash due";
      return "Confirmed";
    case "picked_up":
      return "Picked up";
    case "delivered":
      return "Delivered";
    case "declined":
      return "Declined by driver";
    case "cancelled":
      return "Cancelled";
    default:
      return delivery.status;
  }
}

function paymentMethodLabel(delivery: DeliveryListItem) {
  if (delivery.paymentMethod === "cash") {
    return delivery.isPaid ? "Cash (collected)" : "Cash on trip";
  }
  if (delivery.paymentMethod === "qrph") {
    return delivery.isPaid ? "QR Ph (paid)" : "QR Ph";
  }
  return null;
}

function MyDeliveriesPage() {
  const client = useQueryClient();
  const upcomingQuery = useQuery(upcomingDeliveriesQueryOptions());
  const historyQuery = useQuery(historyDeliveriesQueryOptions());

  const cancelMutation = useMutation({
    mutationFn: cancelDelivery,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: upcomingDeliveriesQueryKey });
      void client.invalidateQueries({ queryKey: historyDeliveriesQueryKey });
    },
  });

  const upcoming = upcomingQuery.data ?? [];
  const history = historyQuery.data ?? [];
  const {
    pageItems: historyPage,
    currentPage: historyPageNumber,
    totalPages: historyTotalPages,
    rangeStart: historyRangeStart,
    rangeEnd: historyRangeEnd,
    totalItems: historyTotalItems,
    goToPage: goToHistoryPage,
    showPagination: showHistoryPagination,
  } = usePagination(history, 5);

  function prefetchDelivery(deliveryId: string) {
    void client.prefetchQuery(deliveryQueryOptions(deliveryId));
  }

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="my-deliveries" />
      <main className="mx-auto max-w-245 px-6 py-10 lg:px-8 lg:py-14">
        <PageHeader
          eyebrow="Your packages"
          title="My Deliveries"
          subtitle="Track package requests. Pay only after the driver accepts."
        />

        <div className="mt-12 space-y-14">
          <section className="space-y-4">
            <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              Upcoming
            </h2>
            {upcomingQuery.isLoading ? (
              <p className="text-[15px] text-[#86868b]">Loading upcoming…</p>
            ) : upcoming.length === 0 ? (
              <p className="rounded-2xl bg-white p-6 text-[15px] text-[#86868b] ring-1 ring-black/5">
                No upcoming deliveries.{" "}
                <Link
                  to="/send-package"
                  className="font-medium text-[#0066cc] hover:underline"
                >
                  Send a package
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((delivery) => (
                  <DeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    onPrefetchPay={
                      delivery.canPay
                        ? () => prefetchDelivery(delivery.id)
                        : undefined
                    }
                    onCancel={
                      delivery.canCancel
                        ? () => cancelMutation.mutate(delivery.id)
                        : undefined
                    }
                    cancelling={
                      cancelMutation.isPending &&
                      cancelMutation.variables === delivery.id
                    }
                    cancelError={
                      cancelMutation.variables === delivery.id
                        ? (
                            cancelMutation.error as Error & {
                              response?: { data?: { message?: string } };
                            }
                          )?.response?.data?.message
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              History
            </h2>
            {historyQuery.isLoading ? (
              <p className="text-[15px] text-[#86868b]">Loading history…</p>
            ) : history.length === 0 ? (
              <p className="text-[15px] text-[#86868b]">
                No past deliveries yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
                <table className="w-full text-left text-[14px]">
                  <thead className="border-b border-black/5 text-[12px] text-[#86868b]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">
                        Payment
                      </th>
                      <th className="px-4 py-3 font-medium text-right">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyPage.map((delivery) => (
                      <tr
                        key={delivery.id}
                        className="border-b border-black/5 last:border-0"
                      >
                        <td className="px-4 py-3 font-mono text-[13px] text-[#0066cc]">
                          {delivery.reference}
                        </td>
                        <td className="hidden px-4 py-3 text-[#1d1d1f] sm:table-cell">
                          {delivery.date}
                        </td>
                        <td className="px-4 py-3 text-[#1d1d1f]">
                          {delivery.route}
                        </td>
                        <td className="px-4 py-3 text-[#86868b]">
                          {statusLabel(delivery)}
                        </td>
                        <td className="hidden px-4 py-3 text-[#86868b] md:table-cell">
                          {paymentMethodLabel(delivery) ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#1d1d1f]">
                          {delivery.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {showHistoryPagination && (
                  <TablePagination
                    currentPage={historyPageNumber}
                    totalPages={historyTotalPages}
                    rangeStart={historyRangeStart}
                    rangeEnd={historyRangeEnd}
                    totalItems={historyTotalItems}
                    itemLabel="deliveries"
                    onPageChange={goToHistoryPage}
                  />
                )}
              </div>
            )}
          </section>

          <div className="rounded-2xl bg-[#1d1d1f] px-6 py-8 text-center sm:px-10">
            <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-white">
              Need to send something?
            </h3>
            <p className="mt-2 text-[15px] text-white/70">
              Request cargo on a published van trip — the driver chooses whether
              to accept.
            </p>
            <Button
              className="mt-5 h-11 rounded-full bg-white px-6 text-[14px] text-[#1d1d1f] hover:bg-white/90"
              asChild
            >
              <Link to="/send-package">Send a package</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DeliveryCard({
  delivery,
  onCancel,
  onPrefetchPay,
  cancelling,
  cancelError,
}: {
  delivery: DeliveryListItem;
  onCancel?: () => void;
  onPrefetchPay?: () => void;
  cancelling?: boolean;
  cancelError?: string;
}) {
  const isAccepted = delivery.status === "accepted";
  const paymentLabel = paymentMethodLabel(delivery);

  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] font-semibold text-[#0066cc]">
              {delivery.reference}
            </span>
            <span className="rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-[12px] font-medium text-[#1d1d1f]">
              {statusLabel(delivery)}
            </span>
          </div>
          <h3 className="text-[17px] font-semibold text-[#1d1d1f]">
            {delivery.route}
          </h3>
          <p className="text-[14px] text-[#86868b]">
            {delivery.date} · {delivery.time} · {delivery.packageLabel}
          </p>
          <p className="text-[14px] text-[#1d1d1f]">
            {delivery.pickupAddress} → {delivery.dropoffAddress}
          </p>
          <p className="text-[13px] text-[#86868b]">
            Receiver: {delivery.receiverName} · {delivery.receiverPhone}
          </p>
          {paymentLabel && (
            <p className="text-[13px] text-[#86868b]">
              Payment: {paymentLabel}
            </p>
          )}
          {delivery.status === "pending" && (
            <p className="text-[13px] text-[#bf4800]">
              Waiting for the driver to accept before you can pay.
            </p>
          )}
          {isAccepted && (
            <p className="text-[13px] text-[#86868b]">
              Driver set this fee. Pay to confirm, or cancel if it&apos;s too
              expensive.
            </p>
          )}
          {delivery.status === "confirmed" &&
            delivery.paymentMethod === "cash" &&
            !delivery.isPaid && (
              <p className="text-[13px] text-[#bf4800]">
                Pay cash to the driver on trip day — not marked as paid online.
              </p>
            )}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <p className="text-[20px] font-semibold text-[#1d1d1f]">
            {delivery.price}
          </p>
          {delivery.canPay && (
            <Button
              className="h-9 rounded-full bg-[#0071e3] px-4 text-[13px] hover:bg-[#0077ed]"
              asChild
            >
              <Link
                to="/my-deliveries/$deliveryId/pay"
                params={{ deliveryId: delivery.id }}
                onMouseEnter={onPrefetchPay}
                onFocus={onPrefetchPay}
                onTouchStart={onPrefetchPay}
              >
                Pay now
              </Link>
            </Button>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full border-[#d2d2d7] px-4 text-[13px] text-[#bf4800] hover:bg-[#fff5f0] hover:text-[#bf4800]"
              disabled={cancelling}
              onClick={onCancel}
            >
              {cancelling ? "Cancelling…" : "Cancel"}
            </Button>
          )}
        </div>
      </div>
      {cancelError && (
        <p className="mt-3 text-[13px] text-[#bf4800]">{cancelError}</p>
      )}
    </article>
  );
}
