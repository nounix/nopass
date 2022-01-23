#!/bin/bash
nc -z localhost 31313
[ $? -eq 0 ] && exit

cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
java -jar "${BASH_SOURCE[0]}" "$@"
exit $?
