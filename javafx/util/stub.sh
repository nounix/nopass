#!/bin/bash
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
java -jar "${BASH_SOURCE[0]}" "$@"
exit $?
