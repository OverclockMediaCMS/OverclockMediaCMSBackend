
WITHOUTEXT=$(basename $1 .args)
cat $1 | xargs curl  2> /dev/null | diff - "expect/$WITHOUTEXT.json"

IFPASSED=$?

if [ "$IFPASSED" -eq 0 ]; then
    echo "$WITHOUTEXT Passed"
else
    echo "$WITHOUTEXT Failed"
fi
