#!/bin/bash
# Returns JSON facts for "local" and "system" accounts

# System accounts defined as UIDs equal or less than <GID_MIN>
min_uid=$(grep '^GID_MIN' /etc/login.defs | awk '{print $2}')
user_info='{'
system_user_info='{'

while read i
do
    read username userid pgroup homedir user_shell <<< "${i}"
    # Assume user is local and interactive only if assigned a
    # valid shell from /etc/shells that is not 'nologin'
    [ "x$( grep $user_shell /etc/shells | grep -v 'nologin' )" == "x" ] && continue 

    # Grab the first available public key with a corresponding private
    unset key_file
    for j in $(ls ${homedir}/.ssh/*.pub 2>/dev/null 2>/dev/null)
    do
      if [ -f "${homedir}/.ssh/$(basename ${j} .pub)" ]
      then
        key_file=$j
        break
      fi
    done
    if [ -z "${key_file}" ]
    then
        key_parms='{}'
    else
        # Get SSH pub key components
        read ssh_key_type ssh_key_value ssh_key_comment <<< "$(cat ${key_file} | awk '{print $1,$2,$3}')"
        key_parms="{\"type\": \"${ssh_key_type}\", \"value\": \"${ssh_key_value}\", \"comment\": \"${ssh_key_comment}\"}"
    fi

    base_line="\"${username}\": {\"home\": \"${homedir}\", \"group\": \"${pgroup}\", \"key\": ${key_parms}}"
    if [ $userid -ge $min_uid ]
    then
        if [ "${user_info}" = '{' ]
        then
            user_info="${user_info}${base_line}"
        else
            user_info="${user_info}, ${base_line}"
        fi
    else
        if [ "${system_user_info}" = '{' ]
        then
            system_user_info="${system_user_info}${base_line}"
        else
            system_user_info="${system_user_info}, ${base_line}"
        fi
    fi

done < <(cat /etc/passwd | awk -F':' '{print $1,$3,$4,$6,$7}')

echo "local_user_info=${user_info}}"
echo "system_user_info=${system_user_info}}"
