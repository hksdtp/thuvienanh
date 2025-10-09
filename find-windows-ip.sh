#!/bin/bash

echo "🔍 Finding Windows 10 Machine IP Address..."
echo ""

# Method 1: Check ARP table for Windows machines
echo "📋 Method 1: Checking ARP table..."
arp -a | grep -i "dynamic\|incomplete" | head -10
echo ""

# Method 2: Check network interfaces
echo "📋 Method 2: Your Mac's Network Info..."
ifconfig | grep "inet " | grep -v 127.0.0.1
echo ""

# Method 3: Check Tailscale (if installed)
echo "📋 Method 3: Checking Tailscale..."
if command -v tailscale &> /dev/null; then
    echo "✅ Tailscale is installed"
    tailscale status | grep -i "windows\|marketing" || echo "No Windows machines found in Tailscale"
else
    echo "❌ Tailscale not installed"
fi
echo ""

# Method 4: Suggest common IP ranges
echo "📋 Method 4: Common IP Ranges to Try..."
echo "   - 192.168.1.x (most common home networks)"
echo "   - 192.168.0.x"
echo "   - 10.0.0.x"
echo "   - 100.101.50.87 (your previous Tailscale IP)"
echo ""

echo "💡 To find your Windows IP:"
echo "   1. On Windows, open Command Prompt"
echo "   2. Run: ipconfig"
echo "   3. Look for 'IPv4 Address' under your active network adapter"
echo ""

