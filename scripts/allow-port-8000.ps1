# Requires Administrator. Allows phones on the LAN to reach BerryIO on TCP 8000.
$ruleName = "BerryIO Backend 8000"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if (-not $existing) {
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000 -Profile Any | Out-Null
    Write-Output "Created firewall rule: $ruleName"
} else {
    Write-Output "Firewall rule already exists: $ruleName"
}
