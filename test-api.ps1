Write-Host "Testing Audit System API..." -ForegroundColor Yellow

$maxAttempts = 10
$attempt = 1

while ($attempt -le $maxAttempts) {
    Write-Host "Attempt $attempt of $maxAttempts..." -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ API is responding!" -ForegroundColor Green
        Write-Host "Status: $($response.StatusCode)"
        Write-Host "Response: $($response.Content)"
        exit 0
    } catch {
        Write-Host "API not ready yet, waiting 2 seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
        $attempt++
    }
}

Write-Host "❌ API failed to respond after $maxAttempts attempts" -ForegroundColor Red
Write-Host "Check if the service is running on port 3001" -ForegroundColor Yellow
exit 1