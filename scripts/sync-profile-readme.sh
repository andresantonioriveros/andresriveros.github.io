#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source_file="${script_dir}/../_includes/profile-readme.md"
target_repo="${1:-${PROFILE_REPO_PATH:-}}"

if [[ -z "${target_repo}" ]]; then
  candidate="$(cd -- "${script_dir}/../../../.." && pwd)/andresantonioriveros"
  if [[ -d "${candidate}/.git" ]]; then
    target_repo="${candidate}"
  else
    printf 'Usage: %s /path/to/andresantonioriveros\n' "${0##*/}" >&2
    printf 'Or set PROFILE_REPO_PATH.\n' >&2
    exit 1
  fi
fi

if [[ ! -f "${source_file}" ]]; then
  printf 'Source file not found: %s\n' "${source_file}" >&2
  exit 1
fi

if [[ ! -d "${target_repo}/.git" ]]; then
  printf 'Target repo not found: %s\n' "${target_repo}" >&2
  exit 1
fi

remote_url="$(git -C "${target_repo}" remote get-url origin 2>/dev/null || true)"
if [[ "${remote_url}" != *"andresantonioriveros/andresantonioriveros"* ]]; then
  printf 'Refusing to write to unexpected repo: %s\n' "${remote_url:-<no origin remote>}" >&2
  exit 1
fi

cp "${source_file}" "${target_repo}/README.md"
printf 'Synced %s -> %s/README.md\n' "${source_file}" "${target_repo}"
