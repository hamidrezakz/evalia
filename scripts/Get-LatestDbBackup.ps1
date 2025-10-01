<#
 .SYNOPSIS
   Fetch (and optionally extract) the latest Postgres logical backup from remote production server.

 .DESCRIPTION
   Lists remote files matching pattern db_YYYYMMDD_HHMMSS.sql.gz in the backups directory,
   downloads the newest one if not already present locally, optionally extracts the plain SQL,
   and applies simple local retention (keep newest N compressed files).

 .PARAMETER ServerIp
   Public IP / DNS of the server (remote host running docker compose).

 .PARAMETER User
   SSH username.

 .PARAMETER KeyPath
   Path to private key used for SSH authentication.

 .PARAMETER RemoteDir
   Remote directory containing backup files (default: ~/evalia/backups).

 .PARAMETER LocalDir
   Local directory to store downloaded backups.

 .PARAMETER Extract
   If present, also produce an uncompressed .sql alongside the .sql.gz (requires gzip in PATH or 7zip fallback comment).

 .PARAMETER Keep
   How many compressed backups (db_*.sql.gz) to retain locally (default 30); older ones are removed.

 .EXAMPLE
   ./Get-LatestDbBackup.ps1 -Extract

 .EXAMPLE
   ./Get-LatestDbBackup.ps1 -ServerIp 185.204.169.179 -KeyPath C:\ssh\serverone\ar-dimah-privatekey.pem -Extract

 .NOTES
   Requires OpenSSH client (ssh, scp) available on Windows 10+ (usually preinstalled) and proper permissions on the key file.
#>
param(
    [string]$ServerIp = "185.204.169.179",
    [string]$User = "ubuntu",
    [string]$KeyPath = "c:\ssh\serverone\ar-dimah-privatekey.pem",
    [string]$RemoteDir = "~/evalia/backups",
    [string]$LocalDir = "C:\data\prod_backups",
    [switch]$Extract,
    [int]$Keep = 30
)

function Write-Info($msg){ Write-Host "[i] $msg" -ForegroundColor Cyan }
function Write-Ok($msg){ Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg){ Write-Warning $msg }
function Write-Err($msg){ Write-Host "[x] $msg" -ForegroundColor Red }

if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) { Write-Err "ssh command not found."; exit 1 }
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) { Write-Err "scp command not found."; exit 1 }

if (-not (Test-Path $KeyPath)) { Write-Err "Key file not found: $KeyPath"; exit 1 }

if (-not (Test-Path $LocalDir)) { Write-Info "Creating local dir $LocalDir"; New-Item -ItemType Directory -Path $LocalDir | Out-Null }

# Get latest remote backup (newest by mtime)
$remoteCmd = "ls -1t $RemoteDir/db_*.sql.gz 2>/dev/null | head -n 1"
try {
  $latest = (ssh -i $KeyPath "${User}@${ServerIp}" $remoteCmd).Trim()
} catch {
    Write-Err "SSH listing failed: $($_.Exception.Message)"; exit 1
}

if (-not $latest) { Write-Warn "No remote backups found in $RemoteDir"; exit 0 }

$fileName = Split-Path $latest -Leaf
$localPath = Join-Path $LocalDir $fileName

if (Test-Path $localPath) {
    Write-Ok "Already downloaded: $fileName"
} else {
    Write-Info "Downloading $fileName"
  $scpResult = & scp -i $KeyPath "${User}@${ServerIp}:$latest" $localPath 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Err "Download failed: $scpResult"; exit 1 }
    Write-Ok "Downloaded $fileName"
}

$fi = Get-Item $localPath
Write-Info ("Size: {0:N2} MB | Created: {1}" -f ($fi.Length/1MB), $fi.CreationTime)

if ($Extract) {
    $sqlPath = [IO.Path]::ChangeExtension($localPath, ".sql")
    if (-not (Test-Path $sqlPath)) {
        Write-Info "Extracting to $sqlPath"
        if (Get-Command gzip -ErrorAction SilentlyContinue) {
            try {
                & gzip -d -c $localPath > $sqlPath
                Write-Ok "Extracted"
            } catch {
                Write-Warn "Extraction failed via gzip: $($_.Exception.Message)"
            }
        } else {
            Write-Warn "gzip not found. Install (e.g. via WSL, Git Bash) or use 7zip to extract manually."
        }
    } else {
        Write-Info "Plain SQL already exists"
    }
}

# Local retention
Write-Info "Applying retention (keep newest $Keep .sql.gz files)"
$gzFiles = Get-ChildItem $LocalDir -Filter "db_*.sql.gz" | Sort-Object LastWriteTime -Descending
if ($gzFiles.Count -gt $Keep) {
    $remove = $gzFiles | Select-Object -Skip $Keep
    foreach ($r in $remove) {
        try {
            Remove-Item $r.FullName -Force
            Write-Info "Removed old: $($r.Name)"
        } catch { Write-Warn "Failed to remove $($r.Name): $($_.Exception.Message)" }
    }
}

Write-Ok "Done"