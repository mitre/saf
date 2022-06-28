#! /bin/bash

gugent_install_dir="/usr/share/gugent"
gugent_pid_file="${gugent_install_dir}/vrm.pid"
gugent_log_file="${gugent_install_dir}/GuestAgent.log"
success_message="found termination node"

[ -f $gugent_pid_file ] && echo "gugent_running=true" || echo "gugent_running=false"

rc=1
if [ -f $gugent_log_file ]
then
    grep -qi "$success_message" $gugent_log_file
    rc=$?
fi

[ $rc -eq 0 ] && echo "gugent_successful=true" || echo "gugent_successful=false"
