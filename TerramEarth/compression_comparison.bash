#!/bin/bash
DATAFILE=${1:-data.json}
if [ -f $DATAFILE.gz ]; then gunzip $DATAFILE.gz; fi
echo 'original:'
ls -lat $DATAFILE
echo 'trying gzip default compression level (6)'
time gzip $DATAFILE
ls -lat $DATAFILE.gz
if [ -f $DATAFILE.gz ]; then gunzip $DATAFILE.gz; fi
echo 'trying gzip fastest compression level (1)'
time gzip -1 $DATAFILE
ls -lat $DATAFILE.gz
if [ -f $DATAFILE.gz ]; then gunzip $DATAFILE.gz; fi
echo 'trying gzip max compression level (9)'
time gzip -9 $DATAFILE
ls -lat $DATAFILE.gz
