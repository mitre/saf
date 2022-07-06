#!/bin/bash

distributor=$( echo $(lsb_release --id | cut -d':' -f2) )

case $distributor in
  'RedHatEnterpriseServer')
    sudoersd_dir='/etc/sudoers.d'
    ;;
esac

if [ -z "$sudoersd_dir" ]
then
  echo "sudoersd_files='NONE'"
  exit 0
fi

sudoersd_files='NONE'
while read i
do
  if [ "${sudoersd_files}" = 'NONE' ]
  then
    sudoersd_files="${i}"
  else
    sudoersd_files="${sudoersd_files},${i}"
  fi
done < <(ls ${sudoersd_dir})

echo "sudoersd_files=${sudoersd_files}"
