#!/bin/bash 
# Borrowed and modified from best practice guide:
#  https://access.redhat.com/sites/default/files/attachments/deploying_oracle_rac_12c_rhel7_v1.2_updated_08-01-2016.pdf

KERN=`uname -r | awk -F. '{ printf("%d.%d\n",$1,$2); }'` 

# Find out the HugePage size 
HPG_SZ=`grep Hugepagesize /proc/meminfo | awk '{print $2}'` 

# Start from 1 pages to be on the safe side and guarantee 1 free HugePage 
NUM_PG=1 

SYS_PAGE_SIZE=`getconf PAGE_SIZE`
DEV_SHM_SIZE_KB=`df /dev/shm | tail -n +2 | awk '{print $2}'`

# Cumulative number of pages required to handle the running shared memory segments 
for SEG_BYTES in `ipcs -m | awk '{print $5}' | grep "[0-9][0-9]*"` 
do 
    MIN_PG=`echo "$SEG_BYTES/($HPG_SZ*1024)" | bc -q` 
    if [ $MIN_PG -gt 0 ]; then 
        NUM_PG=`echo "$NUM_PG+$MIN_PG+1" | bc -q` 
    fi 
done 


# Get current number of Hugepages
CURR_PG=`grep HugePages_Total /proc/meminfo | awk '{print $2}'`
echo "current_hugepages=${CURR_PG}"

# memlock can not be less than 3145728
MEM_LOCK=3145728

# Finish with results 
case $KERN in 
    '2.6'|'3.10')
        HUGEPAGES_KB=`echo "$NUM_PG*$HPG_SZ" | bc -q` 
        [ $HUGEPAGES_KB -gt $MEM_LOCK ] && MEM_LOCK=$HUGEPAGES_KB
        ;; 
    *)
        NUM_PG=0
        ;; 
esac

echo "hugepages=${NUM_PG}" 
echo "hugepage_size_kb=${HPG_SZ}"
echo "sys_pagesize=${SYS_PAGE_SIZE}"
echo "dev_shm_size_kb=${DEV_SHM_SIZE_KB}"
