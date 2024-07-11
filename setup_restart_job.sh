# !/bin/bash

sudo cp jv_restart_job.sh /usr/local/bin/jv_restart_job.sh
sudo cp jv_restart_job.service /etc/systemd/system/jv_restart_job.service
sudo chmod 755 /usr/local/bin/jv_restart_job.sh
sudo chmod 664 /etc/systemd/system/jv_restart_job.service

sudo systemctl daemon-reload
sudo systemctl enable jv_restart_job.service