#!/bin/bash

# 'Publish' local host keys
for i in $(ls /etc/ssh/ssh_host*.pub)
do
    read key_type key_value <<< "$(cat $i)"

    if [ -z "$ssh_host_keys" ]
    then
        ssh_host_keys="{\"${key_type}\": \"${key_value}\""
    else
        ssh_host_keys="${ssh_host_keys}, \"${key_type}\": \"${key_value}\""
    fi
done

ssh_host_keys="${ssh_host_keys}}"

echo "ssh_host_keys=${ssh_host_keys}"
