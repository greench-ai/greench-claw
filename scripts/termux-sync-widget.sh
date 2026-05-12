#!/data/data/com.termux/files/usr/bin/bash
# NexisClaw OAuth Sync Widget
# Syncs Claude Code tokens to NexisClaw on l36 server
# Place in ~/.shortcuts/ on phone for Termux:Widget

termux-toast "Syncing NexisClaw auth..."

# Run sync on l36 server
SERVER="${NEXISCLAW_SERVER:-l36}"
RESULT=$(ssh "$SERVER" '/home/admin/NexisClaw/scripts/sync-claude-code-auth.sh' 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    # Extract expiry time from output
    EXPIRY=$(echo "$RESULT" | grep "Token expires:" | cut -d: -f2-)

    termux-vibrate -d 100
    termux-toast "NexisClaw synced! Expires:${EXPIRY}"

    # Optional: restart NexisClaw service
    ssh "$SERVER" 'systemctl --user restart NexisClaw' 2>/dev/null
else
    termux-vibrate -d 300
    termux-toast "Sync failed: ${RESULT}"
fi
