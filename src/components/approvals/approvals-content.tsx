export function ApprovalsContent() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Finance Ops
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Approvals</h1>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Review pending requests and keep the workflow moving. This page is a
            lightweight placeholder until the approvals pipeline is wired in.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Expense Requests</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              No requests are waiting for approval.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Purchase Orders</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              All purchase orders are up to date.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
          Connect this page to your approvals service to surface pending items,
          SLA timers, and escalation actions.
        </section>
      </div>
    </main>
  );
}
