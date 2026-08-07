import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';
import { SignOutAction } from '@/components/AuthActions';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { getGameForUser } from '@/server/modules/games/service';
import { listServicesForGame } from '@/server/modules/serviceEnrollment/service';
import { listAuditEvents } from '@/server/modules/audit/service';

type PageProps = { params: Promise<{ gameId: string }> };

export default async function GameOverviewPage({ params }: PageProps) {
  const user = await requireCurrentUser();
  const { gameId } = await params;
  const game = await getGameForUser(gameId, user.id);
  const services = await listServicesForGame({ gameId, actorUserId: user.id });
  const auditEvents = await listAuditEvents('game', gameId);
  const pipeline = services.find((service) => service.definition.serviceKey === 'pipeline');

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">OGD</span>
          <span>Platform</span>
        </Link>
        <SignOutAction />
      </header>

      <div className="overview-grid">
        <main className="stack">
          <Link className="button secondary" href="/">
            <ArrowLeft size={16} />
            Back to workspace
          </Link>

          <section className="panel">
            <p className="eyebrow">Game Overview</p>
            <h1>{game.name}</h1>
            <p className="lead">{game.description || 'No description has been added yet.'}</p>
            <div className="metrics">
              <div className="metric">
                <strong>{game.lifecycleStatus}</strong>
                <span>Lifecycle</span>
              </div>
              <div className="metric">
                <strong>{game.privacyClassification}</strong>
                <span>Privacy</span>
              </div>
              <div className="metric">
                <strong>{game.releaseStatus}</strong>
                <span>Release</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Service Enrollment</p>
            {pipeline ? (
              <div className="stack">
                <h2>
                  <Database size={18} /> {pipeline.definition.displayName}
                </h2>
                <span className={pipeline.status === 'setup_required' ? 'status warn' : 'status green'}>
                  {pipeline.status}
                </span>
                <p>{pipeline.definition.description}</p>
                {pipeline.enrollment ? (
                  <p className="meta">Enrollment ID: {pipeline.enrollment.id}</p>
                ) : null}
                {pipeline.handoffUrl ? (
                  <a className="button" href={pipeline.handoffUrl}>
                    Continue Pipeline setup
                  </a>
                ) : (
                  <p>Pipeline setup is waiting for a downstream setup URL or resource reference.</p>
                )}
              </div>
            ) : (
              <p>Pipeline is not enrolled for this Game.</p>
            )}
          </section>
        </main>

        <aside className="panel">
          <p className="eyebrow">Audit</p>
          <div className="timeline">
            {auditEvents.map((event) => (
              <div className="timeline-item" key={event.id}>
                <h3>{event.action}</h3>
                <p className="meta">
                  {event.actor.primaryEmail} · {event.occurredAt.toLocaleString()}
                </p>
              </div>
            ))}
            {auditEvents.length === 0 ? <p>No audit events recorded yet.</p> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
