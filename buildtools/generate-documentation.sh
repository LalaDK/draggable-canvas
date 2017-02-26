#!/usr/bin/env bash
jsdoc -r --readme ../README.md -c jsdoc.conf -d ../docs/
gnome-open ../docs/index.html
