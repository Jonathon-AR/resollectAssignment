#!/bin/bash
while true; do
  echo "Running cron jobs at $(date)"
  python manage.py runcrons
done