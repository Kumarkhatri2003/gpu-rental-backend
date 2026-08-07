#!/bin/bash
set -e

echo "Starting SSH service..."

exec /usr/sbin/sshd -D -e