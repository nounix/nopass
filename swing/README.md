# iPASS

iPASS is a password manager and generator which uses AES encryption and SHA-3 hashing.

# Build

## Docker:
- $ docker build -t ipass .
- $ ./ipass.sh

## Without docker:
- $ ./gradlew build gen
- $ ./ipass

## Todo
- check timer clear cb to not override
- create make file which builds and add payload
- stop window moving up when open notes

# License
This Project is released under GNU GPLv3 licence. Copyright (c) Martin Muenning.