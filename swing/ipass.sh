#!/bin/sh

# TODO: save notes

nc -z localhost 31313

[ $? -eq 0 ] || docker run \
    --rm \
    --net=host \
    -d \
    -e DISPLAY \
    -v $XAUTHORITY:/home/ipass/.Xauthority \
    -v /usr/share/fonts/:/usr/share/fonts/ \
    ipass
