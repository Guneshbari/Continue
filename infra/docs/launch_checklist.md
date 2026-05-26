# Continue — MVP Launch & Accessibility Checklist

Production readiness guidelines to ensure high accessibility compliance, secure logging configurations, and clean SEO indexes before public MVP deployment.

---

## 1. Production Environments & Operational Observability

- [ ] **Log Size Enforcements**: Confirm `docker-compose.yml` restricts container log files to a maximum of `10m` size with a `3` file rotation count.
- [ ] **HTTP/2 Multiplexing**: Confirm `nginx.conf` has `listen 443 ssl http2` enabled to facilitate rapid, concurrent cover artwork streams.
- [ ] **Container Healthcheck Status**: Verify both `api` and `web` containers report a `healthy` status under Docker Compose:
  ```bash
  docker compose ps
  ```
- [ ] **Verify Database Backups**: Confirm a cron job triggers `infra/scripts/backup.sh` daily and that `gzip -t` verification succeeds.

---

## 2. Public SEO & Dynamic Metadata Audits

- [ ] **Sitemap Verification**: Visit `/sitemap.xml` directly to confirm all platform hubs and dynamically queried game paths are listed.
- [ ] **Robots crawling Directives**: Visit `/robots.txt` and confirm indexing exclusions are configured correctly (e.g. `/api/` or private edit paths blocked).
- [ ] **OpenGraph/Twitter Meta Checks**: Verify that dynamic detail pages contain explicit canonical tags and OpenGraph card images in headers.
- [ ] **Query Canonicalization Check**: Confirm alphabetic query sorting (`qs.sort()`) is active on dynamically generated parameters.
- [ ] **noindex offset Sweeps**: Access deep scroll pages (e.g. index paths with offsets) and confirm `<meta name="robots" content="noindex, follow" />` is rendered.

---

## 3. Manual Accessibility Sweep Checklist

Accessibility is a core platform pillar. Execute this manual audit before launch:

- [ ] **Keyboard-Only Navigation Tab Sweep**:
  - Focus a browser tab, hit `Tab` repeatedly, and confirm the `<SkipLink />` appears immediately at the top of the viewport.
  - Press `Enter` on the skip link and confirm focus moves directly to the `#main-content` layout.
  - Tab through all header navbar links and verify a clear, high-visibility focus outline ring surrounds active nodes.
- [ ] **Keyboard Focus Trap audit**:
  - Activate the global search command palette via `Ctrl+K` or `/`.
  - Confirm keyboard focus is locked within the palette input and that typing is captured.
  - Verify `ArrowDown`/`ArrowUp` correctly highlight suggestions, `Escape` closes the panel, and `Enter` triggers active selections.
  - Confirm focus returns gracefully to the trigger node on close.
- [ ] **Prefers-Reduced-Motion checks**:
  - Toggle "Reduce Motion" in system settings.
  - Sweep the catalog cards and confirm all hover scale transformations (`translate-y-[-4px]`) and transitions are safely disabled or flattened.
- [ ] **Screen-Reader Heading Hierarchy Audit**:
  - Run a screen-reader sweep (e.g., VoiceOver or NVDA).
  - Verify every page maintains a single `<h1>` tag mapping the main page name, with sub-sections strictly following a linear `<h2>` through `<h6>` structure.
  - Confirm all icons use `aria-hidden="true"` and interactive controls feature clear `aria-label` text descriptions.
