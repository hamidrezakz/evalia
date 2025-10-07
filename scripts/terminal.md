## Remote DB Backup & Retrieval Quick Commands

### 1. SSH into server (change key path if needed)

ssh -i "c:\ssh\serverone\ar-dimah-privatekey.pem" ubuntu@185.204.169.179

### 2. Run backup script on server (from repo root on server)

# (Assuming project at ~/evalia)

cd ~/evalia
bash scripts/db-backup.sh

### 3. (Optional) List existing backups on server

ls -1t backups/db\_\*.sql.gz | head -n 5

### 4. Download latest backup to local machine (from Windows host repo root)

powershell -ExecutionPolicy Bypass -File .\scripts\Get-LatestDbBackup.ps1

### 5. Download and extract plain SQL too

powershell -ExecutionPolicy Bypass -File .\scripts\Get-LatestDbBackup.ps1 -Extract

### 6. Restore locally into a dockerized Postgres (example)

# Start local db if not running

docker ps | findstr doneplay-db

# Copy file path (adjust to actual downloaded latest file)

gunzip -c C:\data\prod_backups\db_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T db psql -U postgres -d doneplay

### 7. Override retention (keep more local backups)

powershell -ExecutionPolicy Bypass -File .\scripts\Get-LatestDbBackup.ps1 -Keep 60

### 8. Change remote directory (if different deploy path)

powershell -ExecutionPolicy Bypass -File .\scripts\Get-LatestDbBackup.ps1 -RemoteDir "~/another/path/backups"

### 9. Verify size after download

Get-ChildItem C:\data\prod*backups -Filter "db*\*.sql.gz" | Sort-Object LastWriteTime -Descending | Select-Object -First 3 | Format-Table Name,Length,LastWriteTime

### 10. One-liner end-to-end (server backup + local fetch + extract)

# Run on server (manual), then locally:

ssh -i "c:\ssh\serverone\ar-dimah-privatekey.pem" ubuntu@185.204.169.179 "cd ~/evalia && bash scripts/db-backup.sh"; powershell -ExecutionPolicy Bypass -File .\scripts\Get-LatestDbBackup.ps1 -Extract
