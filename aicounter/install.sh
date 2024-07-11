#!/bin/bash


curl -s https://install.zerotier.com | sudo bash
sudo zerotier-cli join e3918db483b796a2
sudo zerotier-cli listnetworks

sudo apt update
sudo apt install nano


