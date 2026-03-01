#!/bin/bash

# NeduNet Cloudflare Tunnel Monitor
# Runs every minute. If a tunnel goes down, restarts it and logs the new URL to Desktop.

API_PORT=8080
UI_PORT=5173
API_LOG="/home/ubuntu/projects/api_tunnel.log"
UI_LOG="/home/ubuntu/projects/ui_tunnel.log"
OUTPUT_FILE="/home/ubuntu/Desktop/AKTIF_LINKLER.txt"

function get_url() {
    local LOG_FILE=$1
    echo $(grep -a -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' "$LOG_FILE" | tail -1)
}

function check_and_restart() {
    local PORT=$1
    local LOG_FILE=$2
    local NAME=$3
    
    # Check if process exists
    if ! pgrep -f "cloudflared tunnel --url http://localhost:${PORT}" > /dev/null; then
        echo "$(date): $NAME Tunnel down! Restarting..."
        
        # Kill any zombie related to this port just in case
        pkill -f "cloudflared tunnel --url http://localhost:${PORT}"
        
        # Start new tunnel
        nohup cloudflared tunnel --url http://localhost:${PORT} > "$LOG_FILE" 2>&1 &
        
        # Wait for Cloudflare to generate URL
        sleep 6
        
        local NEW_URL=$(get_url "$LOG_FILE")
        
        echo "$(date): $NAME Tunnel restarted -> $NEW_URL"
        
        # Notify user context if possible
        su -c "DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus notify-send 'Cloudflare Tunnel Failed!' 'Restarted $NAME Tunnel.\nNew URL: $NEW_URL'" ubuntu || true
        
        return 1 # indicating a restart happened
    fi
    return 0
}

# Ensure file exists
mkdir -p /home/ubuntu/Desktop
touch "$OUTPUT_FILE"

while true; do
    API_RESTARTED=false
    UI_RESTARTED=false
    
    check_and_restart $API_PORT "$API_LOG" "API"
    if [ $? -eq 1 ]; then API_RESTARTED=true; fi
    
    check_and_restart $UI_PORT "$UI_LOG" "Frontend"
    if [ $? -eq 1 ]; then UI_RESTARTED=true; fi
    
    if [ "$API_RESTARTED" = true ] || [ "$UI_RESTARTED" = true ]; then
        # Write to desktop file
        echo "=====================================" > "$OUTPUT_FILE"
        echo "SON GÜNCELLEME: $(date)" >> "$OUTPUT_FILE"
        echo "-------------------------------------" >> "$OUTPUT_FILE"
        echo "MERCHANT PANEL (Frontend): $(get_url $UI_LOG)" >> "$OUTPUT_FILE"
        echo "API (Backend): $(get_url $API_LOG)" >> "$OUTPUT_FILE"
        echo "=====================================" >> "$OUTPUT_FILE"
    fi
    
    # Check if file has our latest URLs anyway
    if ! grep -q "MERCHANT PANEL" "$OUTPUT_FILE"; then
        echo "=====================================" > "$OUTPUT_FILE"
        echo "SON GÜNCELLEME: $(date)" >> "$OUTPUT_FILE"
        echo "-------------------------------------" >> "$OUTPUT_FILE"
        echo "MERCHANT PANEL (Frontend): $(get_url $UI_LOG)" >> "$OUTPUT_FILE"
        echo "API (Backend): $(get_url $API_LOG)" >> "$OUTPUT_FILE"
        echo "=====================================" >> "$OUTPUT_FILE"
    fi
    
    sleep 60
done
