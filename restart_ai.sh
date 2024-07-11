#!/bin/bash
ID=1

# Function to check if a string is a number
is_number() {
    re='^[0-9]+$'
    if ! [[ $1 =~ $re ]] ; then
        return 1
    else
        return 0
    fi
}

# check if ID.txt exists
if [ -f "/home/ubuntu/id.txt" ]; then
    ID=$(cat /home/ubuntu/id.txt)
fi

if [ $# -gt 0 ]; then
    if is_number "$1"; then
        ID=$1
    fi
fi

echo "id: $ID"

# save the id
echo $ID > /home/ubuntu/id.txt

echo "start re-activating ai..."
cd aicounter

cd ai
echo "prepare docker image..."
./0_prepare.sh $ID
chmod +x *.sh
echo "start docker container..."
./2_start_docker.sh
cd ..

echo "ai activated"