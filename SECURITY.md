# Security policy

## Reporting a vulnerability

Please report security vulnerabilities privately through GitHub: go to the [Security tab](https://github.com/ruiyuwg/docscn/security) and choose **Report a vulnerability**. Don't open a public issue or pull request for a vulnerability.

Include a description of the issue, the affected component or page, and steps to reproduce it. You'll get an acknowledgement within a few days, and updates as it's investigated and fixed.

## Scope

- The registry components in `apps/www/registry/`, which are installed as source into users' projects
- The registry served from `https://docscn.dev/r/`
- The docscn.dev site

Vulnerabilities in dependencies such as Fumadocs, shadcn/ui, Base UI or Next.js should be reported to those projects. If one affects docscn in a specific way, a report here is still welcome.

## Supported versions

The registry isn't versioned: `shadcn add` always installs the current items from docscn.dev. Fixes are made on `main` and are live once deployed. Components you've already installed are copies in your project, so update them by running `shadcn add` again with `--overwrite`, or by applying the fix by hand.
