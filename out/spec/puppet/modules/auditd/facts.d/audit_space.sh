#!/bin/bash

echo "audit_space_mb=$(( $(df --output=size $(grep '^log_file' /etc/audit/auditd.conf | cut -d'=' -f2) | tail -1) / 1024 ))"
