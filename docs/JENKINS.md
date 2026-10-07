# Jenkins Sprint 1 setup and evidence

Owner: Harshit Chandak (PES2UG24CS185), CSMQ-6.

The repository pipeline is ready for a Jenkins installation. A Jenkins server URL/job was not available during implementation, so this document does not claim a live green Jenkins build or verified webhook.

## Configure once

1. Use a maintained Jenkins installation and a Windows or Linux build agent with Git, Node.js 24 and npm on PATH. Install Pipeline, Git, GitHub, GitHub Branch Source and JUnit plugins.
2. Create a Multibranch Pipeline for `https://github.com/Chandak06/SE-JF-10.git`. Store private repository credentials in Jenkins Credentials. Use branch and pull-request discovery and script path `Jenkinsfile`. Discover `PES2UG24CS185` as well as the integration branch.
3. Run the initial branch scan/build. The Jenkinsfile installs its push trigger and five-minute SCM polling fallback. Configure periodic multibranch indexing if Jenkins cannot receive inbound webhook events, so new PRs/branches are discovered too.
4. For immediate triggers, configure the repository GitHub webhook to the Jenkins `/github-webhook/` endpoint using HTTPS and a configured webhook secret. Enable push and pull-request events. Verify a successful GitHub delivery and build cause on a subsequent commit.
5. Allow the agent outbound access to npm and MongoDB's binary downloads. Tests start their own MongoDB process; no production MongoDB URI or application secret is required. Reuse the workspace binary cache. Do not disable download integrity checks.
6. Inspect stages, JUnit results, HTML/LCOV coverage archives and compiled backend artifacts. Set branch protection to require the CI status only after the actual job is connected and its status name is known.

The pipeline stops on a failing command. JUnit and coverage archive steps run even when tests fail; build artifacts are archived only on success. No deployment stage is included because no development target was provided and final deployment is later-sprint work. A future `frontend/package.json` activates `npm ci`, `npm run test:ci`, and `npm run build` for that module.

## Review evidence to collect

| Case | Procedure | Required evidence |
| --- | --- | --- |
| CI-M4-01 | Push a passing change on the feature branch | Automatic build cause, green stages, JUnit and coverage artifacts |
| CI-M4-02 | On a disposable non-merge demo branch, make an assertion fail and push; then fix it | Red test stage and failing test report, then a green recovery run |

Do not merge the deliberate failure branch. Do not mark CI-M4-01/02 passed based on this Jenkinsfile alone. GitHub Actions uses the same build/test commands as a supplemental executable check, not a substitute for the required Jenkins demonstration.

References: [Jenkins pipeline syntax](https://www.jenkins.io/doc/book/pipeline/syntax/) and [GitHub Branch Source plugin](https://plugins.jenkins.io/github-branch-source/).
