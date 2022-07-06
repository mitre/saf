#!/bin/bash

is_false() {
    case "$1" in
    [fF] | [nN] | [nN][oO] | [fF][aA][lL][sS][eE] | 0)
        return 0
        ;;
    esac
    return 1
}

# Set path for new Puppet4 utilities (Hiera, Facter, etc.)
export PATH="${PATH}:/opt/puppetlabs/bin"

# If this does not appear to be an Oracle Cluster, just exit
cluster_master=$(facter cluster_master)
cluster_members=$(facter cluster_members | tr ',' ' ')
[ -z "${cluster_master}" -o -z "${cluster_members}" ] && exit 0

custom_props_file='/opt/vmware-appdirector/agent/custom.properties'

system_ram=$(cat /proc/meminfo | grep MemTotal | awk '{print $2}')

system_page_sz=$(getconf PAGE_SIZE)

shmall=$( echo "($system_ram * 1024 * 2 / 5)/$system_page_sz" | bc -q)
shmmax=$(( $system_ram * 1024 / 2 ))

echo "shmall=${shmall}"
echo "shmmax=${shmmax}"

if [ -f $custom_props_file ]
then
    net0_mac=$(grep -i virtualmachine\.network0\.macaddress $custom_props_file | cut -d'=' -f2)
    net1_mac=$(grep -i virtualmachine\.network1\.macaddress $custom_props_file | cut -d'=' -f2)
    net2_mac=$(grep -i virtualmachine\.network2\.macaddress $custom_props_file | cut -d'=' -f2)
else
    net0_mac=$(facter net0_mac)
    net1_mac=$(facter net1_mac)
    net2_mac=$(facter net2_mac)
fi

[ -z "${net0_mac}" ] && exit 1
pub_net_file=$(grep -il $net0_mac /etc/sysconfig/network-scripts/ifcfg-* | head -1)
pub_nm_controlled=$(is_false $(grep NM_CONTROLLED ${pub_net_file} | cut -d'=' -f2) && echo 'false' || echo 'true')
oracle_public_interface=$(grep ^NAME ${pub_net_file} | cut -d'=' -f2)
echo "oracle_public_interface=${oracle_public_interface}"
echo "oracle_pub_int_file=${pub_net_file}"
echo "oracle_pub_nm_controlled=${pub_nm_controlled}"
echo "oracle_public_ip=$(facter ipaddress_${oracle_public_interface})"
echo "oracle_public_net=$(facter network_${oracle_public_interface})"

[ -z "${net1_mac}" ] && exit 1
priv_net_file=$(grep -il $net1_mac /etc/sysconfig/network-scripts/ifcfg-* | head -1)
priv_nm_controlled=$(is_false $(grep NM_CONTROLLED ${priv_net_file} | cut -d'=' -f2) && echo 'false' || echo 'true')
oracle_private_interface=$(grep ^NAME ${priv_net_file} | cut -d'=' -f2)
echo "oracle_private_interface=${oracle_private_interface}"
echo "oracle_priv_int_file=${priv_net_file}"
echo "oracle_priv_nm_controlled=${priv_nm_controlled}"
echo "oracle_priv_ip=$(facter ipaddress_${oracle_private_interface})"
echo "oracle_priv_net=$(facter network_${oracle_private_interface})"

if [ ! -z "${net2_mac}" ]
then
  asm_net_file=$(grep -il $net2_mac /etc/sysconfig/network-scripts/ifcfg-* | head -1)
  asm_nm_controlled=$(is_false $(grep NM_CONTROLLED ${asm_net_file} | cut -d'=' -f2) && echo 'false' || echo 'true')
  oracle_asm_interface=$(grep ^NAME ${asm_net_file} | cut -d'=' -f2)
  echo "oracle_asm_interface=${oracle_asm_interface}"
  echo "oracle_asm_int_file=${asm_net_file}"
  echo "oracle_asm_nm_controlled=${asm_nm_controlled}"
  echo "oracle_asm_ip=$(facter ipaddress_${oracle_asm_interface})"
  echo "oracle_asm_net=$(facter network_${oracle_asm_interface})"
fi

domain=$(hostname -d)
all_members="$cluster_master $cluster_members"

mk_lines () {
  cluster_ips='{'
  new_lines='['
  for i in $all_members
  do
    ip_addr=$(dig ${i}${1}.${domain} +short | head -1)
    [ -z "${ip_addr}" ] && continue
    new_line=$(printf "%-17s%-40s %-20s" ${ip_addr} ${i}${1}.${domain} ${i}${1})

    if [ "${new_lines}" = "[" ]
    then
      new_lines="${new_lines}\"${new_line}\""
      cluster_ips="${cluster_ips}\"${i}\": \"${ip_addr}\""
    else
      new_lines="${new_lines},\"${new_line}\""
      cluster_ips="${cluster_ips},\"${i}\": \"${ip_addr}\""
    fi
  done

  echo "${2}=${new_lines}]"
  [ "${3}" = 'true' ] && echo "cluster_ips=${cluster_ips}}"
}

mk_lines '' 'primary_host_entries' 'true'
mk_lines '-vip' 'vip_host_entries'
mk_lines '-priv' 'pvt_host_entries'
mk_lines '-asmpriv' 'asm_host_entries'

scan_addrs=$(dig ${cluster_master}-scan.${domain} +short)
scan_lines='['
for i in $scan_addrs
do
  scan_line=$(printf "# %-17s%-40s %-20s" ${i} ${cluster_master}-scan.${domain} ${cluster_master}-scan)

  if [ "${scan_lines}" = "[" ]
  then
    scan_lines="${scan_lines}\"${scan_line}\""
  else
    scan_lines="${scan_lines},\"${scan_line}\""
  fi
done

echo "scan_host_entries=${scan_lines}]"
