# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version        | Supported          |
| -------------- | ------------------ |
| Latest Release | :white_check_mark: |
| `main` branch  | :white_check_mark: |
| Older Release  | :x:                |

## Reporting a Vulnerability

Please report suspected vulnerabilities privately by the method below:

- Emailing to `xux510208@gmail.com`

Never not open a public GitHub issue for a suspected vulnerability.

Useful reports should include:

- A short description of the issue and its impact.
- Steps to reproduce, proof-of-concept code, or affected configuration.
- The LigHTTP version or commit, operating system version, device model, and connection type.
- Relevant logs or screenshots with **private data removed**.
- Whether the issue is already public or shared with anyone else.

Examples of issues that should be reported privately include:

- Arbitrary code execution, privilege escalation, or sandbox bypasses.
- Unsafe handling of configuration, profile, update, or asset data.
- Leaks of private configuration, logs, device identifiers, or user activity.
- Security-sensitive behavior in the event hook, IPC, updater, packaging, or device communication paths.

## Coordinated Disclosure Policy

- Do not disclose the issue publicly until a fix has been released or agreed upon.
- Do not exploit the vulnerability beyond what is necessary to demonstrate the proof-of-concept.
- Avoid privacy violations, destruction of data, and interruption or degradation of our service during your testing.

## Recognition

We appreciate the efforts of security researchers who help keep LigHTTP safe. If your report leads to a confirmed security fix, we will happily acknowledge your contribution in the Release Notes and Security Advisory (unless you prefer to remain anonymous).
