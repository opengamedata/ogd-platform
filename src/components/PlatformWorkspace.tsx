'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Database, Plus, RefreshCw } from 'lucide-react';

type Organization = {
  id: string;
  name: string;
  slug: string;
  memberships: { role: string }[];
  games: Game[];
};

type Game = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string | null;
  lifecycleStatus: string;
  privacyClassification: string;
  releaseStatus: string;
};

type ServiceState = {
  status: string;
  handoffUrl: string | null;
  definition: {
    serviceKey: string;
    displayName: string;
    description: string | null;
  };
  enrollment: {
    id: string;
    status: string;
    serviceResourceId: string | null;
    serviceResourceUrl: string | null;
  } | null;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message ?? 'Request failed.');
  }
  return json.data as T;
}

export function PlatformWorkspace({
  initialOrganizations,
}: {
  initialOrganizations: Organization[];
}) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(initialOrganizations[0]?.id ?? '');
  const [selectedGameId, setSelectedGameId] = useState(initialOrganizations[0]?.games[0]?.id ?? '');
  const [orgName, setOrgName] = useState('');
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [lifecycleStatus, setLifecycleStatus] = useState('draft');
  const [privacyClassification, setPrivacyClassification] = useState('test');
  const [releaseStatus, setReleaseStatus] = useState('not_submitted');
  const [services, setServices] = useState<ServiceState[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedOrganization = useMemo(
    () => organizations.find((organization) => organization.id === selectedOrganizationId) ?? null,
    [organizations, selectedOrganizationId],
  );

  const selectedGame = useMemo(
    () => selectedOrganization?.games.find((game) => game.id === selectedGameId) ?? null,
    [selectedOrganization, selectedGameId],
  );

  async function refreshOrganizations(nextSelectedGameId?: string) {
    const response = await fetch('/api/organizations');
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message ?? 'Could not refresh organizations.');
    }
    setOrganizations(json.data.organizations);
    if (nextSelectedGameId) {
      setSelectedGameId(nextSelectedGameId);
    }
  }

  async function refreshServices(gameId = selectedGameId) {
    if (!gameId) {
      setServices([]);
      return;
    }
    const response = await fetch(`/api/games/${gameId}/services`);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message ?? 'Could not refresh services.');
    }
    setServices(json.data.services);
  }

  async function run(action: () => Promise<void>) {
    setError(null);
    setMessage(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  const pipeline = services.find((service) => service.definition.serviceKey === 'pipeline');

  return (
    <div className="workspace">
      <aside className="rail">
        <section className="section">
          <p className="eyebrow">Organizations</p>
          <div className="list">
            {organizations.map((organization) => (
              <button
                className={organization.id === selectedOrganizationId ? 'active' : ''}
                key={organization.id}
                onClick={() => {
                  setSelectedOrganizationId(organization.id);
                  setSelectedGameId(organization.games[0]?.id ?? '');
                  setServices([]);
                }}
                type="button"
              >
                <span>{organization.name}</span>
                <span className="meta">{organization.memberships[0]?.role}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <p className="eyebrow">Create Organization</p>
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              run(async () => {
                const result = await postJson<{ organization: Organization }>('/api/organizations', {
                  name: orgName,
                });
                setOrganizations((current) => [...current, { ...result.organization, memberships: [{ role: 'owner' }], games: [] }]);
                setSelectedOrganizationId(result.organization.id);
                setOrgName('');
                setMessage('Organization created.');
              });
            }}
          >
            <label>
              Name
              <input value={orgName} onChange={(event) => setOrgName(event.target.value)} />
            </label>
            <button type="submit">
              <Plus size={16} />
              Create
            </button>
          </form>
        </section>
      </aside>

      <main className="main">
        <p className="eyebrow">Platform Control Plane</p>
        <h1>Register a Game and hand it to Pipeline setup.</h1>
        <p className="lead">
          This slice keeps ownership, governance, service enrollment, and lifecycle state in Platform while downstream services own their internal setup.
        </p>

        <div className="metrics">
          <div className="metric">
            <strong>{organizations.length}</strong>
            <span>Organizations</span>
          </div>
          <div className="metric">
            <strong>{selectedOrganization?.games.length ?? 0}</strong>
            <span>Games in selected Organization</span>
          </div>
          <div className="metric">
            <strong>{pipeline?.status ?? 'not_enrolled'}</strong>
            <span>Pipeline state</span>
          </div>
        </div>

        <section className="section">
          <p className="eyebrow">Create Game</p>
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              if (!selectedOrganizationId) return;
              run(async () => {
                const result = await postJson<{ game: Game }>(
                  `/api/organizations/${selectedOrganizationId}/games`,
                  {
                    name: gameName,
                    description,
                    lifecycleStatus,
                    privacyClassification,
                    releaseStatus,
                  },
                );
                await refreshOrganizations(result.game.id);
                setSelectedOrganizationId(result.game.organizationId);
                setGameName('');
                setDescription('');
                setMessage('Game created with initial governance state.');
              });
            }}
          >
            <div className="two-col">
              <label>
                Game name
                <input value={gameName} onChange={(event) => setGameName(event.target.value)} />
              </label>
              <label>
                Lifecycle
                <select value={lifecycleStatus} onChange={(event) => setLifecycleStatus(event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="testing">Testing</option>
                  <option value="active">Active</option>
                </select>
              </label>
            </div>
            <label>
              Description
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <div className="two-col">
              <label>
                Privacy classification
                <select
                  value={privacyClassification}
                  onChange={(event) => setPrivacyClassification(event.target.value)}
                >
                  <option value="test">Test</option>
                  <option value="private">Private</option>
                  <option value="embargoed">Embargoed</option>
                  <option value="approved_public">Approved public</option>
                  <option value="restricted_human_subjects">Restricted human subjects</option>
                </select>
              </label>
              <label>
                Release status
                <select value={releaseStatus} onChange={(event) => setReleaseStatus(event.target.value)}>
                  <option value="not_submitted">Not submitted</option>
                  <option value="pending_review">Pending review</option>
                  <option value="changes_requested">Changes requested</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
            </div>
            <button disabled={!selectedOrganizationId} type="submit">
              <Plus size={16} />
              Create Game
            </button>
          </form>
        </section>

        {message ? <p>{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </main>

      <aside className="inspector">
        <section className="section">
          <p className="eyebrow">Games</p>
          <div className="list">
            {selectedOrganization?.games.map((game) => (
              <button
                className={game.id === selectedGameId ? 'active' : ''}
                key={game.id}
                onClick={() => {
                  setSelectedGameId(game.id);
                  refreshServices(game.id).catch((err) =>
                    setError(err instanceof Error ? err.message : 'Could not load services.'),
                  );
                }}
                type="button"
              >
                <span>{game.name}</span>
                <span className="status">{game.lifecycleStatus}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <p className="eyebrow">Selected Game</p>
          {selectedGame ? (
            <div className="stack">
              <h2>{selectedGame.name}</h2>
              <span className="status green">{selectedGame.privacyClassification}</span>
              <span className="status">{selectedGame.releaseStatus}</span>
              <button className="secondary" onClick={() => refreshServices()} type="button">
                <RefreshCw size={16} />
                Refresh services
              </button>
              <button
                onClick={() =>
                  run(async () => {
                    await postJson(`/api/games/${selectedGame.id}/service-enrollments`, {
                      serviceKey: 'pipeline',
                    });
                    await refreshServices(selectedGame.id);
                    setMessage('Pipeline enrollment created. Setup is waiting on the Pipeline service.');
                  })
                }
                type="button"
              >
                <Database size={16} />
                Enroll Pipeline
              </button>
              {pipeline ? (
                <div className="panel">
                  <h3>{pipeline.definition.displayName}</h3>
                  <p>{pipeline.definition.description}</p>
                  <span className={pipeline.status === 'setup_required' ? 'status warn' : 'status green'}>
                    {pipeline.status}
                  </span>
                  {pipeline.handoffUrl ? (
                    <p>
                      <a className="button secondary" href={pipeline.handoffUrl}>
                        Continue setup <ArrowRight size={16} />
                      </a>
                    </p>
                  ) : (
                    <p>Pipeline setup is not yet configured. Enrollment ID is stable for downstream handoff.</p>
                  )}
                </div>
              ) : null}
              <Link className="button secondary" href={`/games/${selectedGame.id}`}>
                View overview <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <p>Create or select a Game to continue.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
