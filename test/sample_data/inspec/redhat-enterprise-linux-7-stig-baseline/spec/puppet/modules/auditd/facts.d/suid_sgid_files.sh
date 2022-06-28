#!/bin/bash

for i in $(find / -xdev -type f -perm -4000 2>/dev/null)
do
    if [ -z "${suid_list}" ]
    then
        suid_list="${i}"
    else
        suid_list="${suid_list}:${i}"
    fi
done

for i in $(find / -xdev -type f -perm -2000 2>/dev/null)
do
    if [ -z "${sgid_list}" ]
    then
        sgid_list="${i}"
    else
        sgid_list="${sgid_list}:${i}"
    fi
done

echo "suid_list=${suid_list}"
echo "sgid_list=${sgid_list}"
