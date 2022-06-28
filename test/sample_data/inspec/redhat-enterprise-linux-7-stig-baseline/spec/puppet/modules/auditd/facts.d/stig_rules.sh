#!/bin/bash

echo "stig_rules_file=$(/bin/rpm -ql audit | /bin/grep stig.rules)"
