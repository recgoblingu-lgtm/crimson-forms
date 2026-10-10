# Crimson Forms

Crimson is a GitHub-only form builder and publishing prototype. GitHub Pages serves the form catalog and builder. GitHub Actions validates and saves form definitions, turns each definition into a GitHub Issue Form, and publishes the updated catalog. Responses are created as GitHub issues.

## How to make and save a form

1. Open the deployed Crimson site and choose **Form Studio**.
2. Create a title, short description, and questions. Supported question types are short answer, long answer, dropdown, and checkboxes.
3. Choose **Prepare definition** and copy the JSON.
4. Open **Actions → Save and publish forms → Run workflow**. Paste the JSON into `form_json` and run it.
5. The workflow validates the definition, commits it under `forms/`, creates `.github/ISSUE_TEMPLATE/crimson-<slug>.yml`, updates the published catalog, and deploys GitHub Pages.
6. The published form appears on the Crimson home page. Respondents fill it out through GitHub Issues.

Saving runs through GitHub’s own access control: only repository users who have permission to run the workflow and write repository contents can save/publish forms. The public Form Studio is only a draft tool; it does not contain a password or a repository token. A password check in public JavaScript would not provide real access control.

## Webhook delivery

To forward new form submissions, add a repository Actions secret named `CRIMSON_WEBHOOK_URL` under **Settings → Secrets and variables → Actions**. The `Forward Crimson responses` workflow POSTs a JSON object containing the repository, issue, title, body, and issue URL to that secret URL. The URL is never stored in the public form definition or site files.

If the secret is absent, the workflow adds a comment mentioning the repository owner so GitHub notifications can alert them (subject to their notification settings). GitHub Actions does not natively send a form submission to an arbitrary email address; this repository-only implementation supports webhook delivery and GitHub’s own notifications.

## Important privacy and account limitations

- This repository is public, and submitted answers are public GitHub issues. Do not ask for passwords, payment details, health information, or other confidential data.
- Respondents need a GitHub account to submit an issue form.
- Form definitions and template names are public. GitHub repository permissions protect saving, not viewing the public Form Studio.
- GitHub Pages is static. Crimson uses GitHub Issues and Actions instead of a separate application server.

## Development

The site is plain HTML/CSS/JavaScript under `site/`. Form definitions are JSON under `forms/`. Run `node scripts/build.mjs` to validate all saved definitions, regenerate issue templates and the form catalog, and prepare the site. The `Save and publish forms` workflow performs this step before publishing.
