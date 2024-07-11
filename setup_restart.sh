#!/bin/bash

echo "Setup restart script for device"

# Remove any existing cron job that has the restart function
(crontab -l 2>/dev/null | grep -v "/sbin/shutdown -r now") | crontab -

# Create a cron job to run the restart script at midnight
(crontab -l 2>/dev/null; echo "0 0 * * * /sbin/shutdown -r now") | crontab -

echo "Setup complete. The device will restart every midnight."
