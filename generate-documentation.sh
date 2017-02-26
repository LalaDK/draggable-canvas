#!/usr/bin/env bash
jsdoc -r --readme README.md -c jsdoc.conf -d ./doc/
gnome-open ./doc/index.html
