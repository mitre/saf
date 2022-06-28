#!/bin/bash
#set -x

primary_interface="unknown"
ipv6_addrs="none"

finish () {
    echo "primary_interface=${primary_interface}"
    echo "ipv6_addrs=${ipv6_addrs}"
    exit ${1}
}

# Assume primary interface is the one that corresponds to 
# the hostname of the machine
hostname=$(hostname -f)
primary_ip=$(dig $hostname +short) 
[ -z "${primary_ip}" ] && finish 0
unset hostname

if_file=$(grep -l ${primary_ip} /etc/sysconfig/network-scripts/ifcfg-*) || finish 1
if_name=$(grep "^DEVICE=" ${if_file} | cut -d'=' -f2 | head -1)
primary_interface=${if_name}

# Get all interfaces with configured IPv4 addresses and locate IPv6 address
for i in $(grep -l 'IPADDR=' /etc/sysconfig/network-scripts/ifcfg-*)
do
    if_name=$(grep "^DEVICE=" ${i} | cut -d'=' -f2 | tr -d '"')
    # Filter out localhost interface
    [ "${if_name}" = "lo" ] && continue
    # Filter out backups and other duplicate files
    [ "$(basename ${i})" != "ifcfg-${if_name}" ] && continue
    ip_addr=$(grep "^IPADDR=" ${i} | cut -d'=' -f2 | tr -d '"')
    hostname=$(dig -x ${ip_addr} +short) 
    [ -z "${hostname}" ] && continue

    ipv6_addr=$(dig ${hostname} AAAA +short)
    [ -z "${ipv6_addr}" ] && continue

    if [ "${ipv6_addrs}" = "none" ]
    then
        ipv6_addrs="${if_name}|${ipv6_addr}"
    else
        ipv6_addrs="${ipv6_addrs},${if_name}|${ipv6_addr}"
    fi
done

finish 0
