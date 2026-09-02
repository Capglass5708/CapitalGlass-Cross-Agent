# Install Windows tasks + .wslconfig persistence for Cross-Agent index publication on WESLEYDESK.
# Run from elevated PowerShell on CG-WESLEYDESK-01.
$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $ScriptDir 'install-wesleydesk-wsl-persistence.ps1')
