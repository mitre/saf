#!/bin/bash

for i in $( ls /etc/ssh/ssh_host*key )
do
  if [ -z "$local_ssh_priv_keys" ]
  then
    local_ssh_priv_keys=$i
  else
    local_ssh_priv_keys="$local_ssh_priv_keys,$i"
  fi
done

for i in $( ls /etc/ssh/ssh_host*key.pub )
do
  if [ -z "$local_ssh_pub_keys" ]
  then
    local_ssh_pub_keys=$i
  else
    local_ssh_pub_keys="$local_ssh_pub_keys,$i"
  fi
done

echo "local_ssh_priv_keys=$local_ssh_priv_keys"
echo "local_ssh_pub_keys=$local_ssh_pub_keys"
