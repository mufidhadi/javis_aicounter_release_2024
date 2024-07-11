#!/bin/bash
echo "🚀 bismillah, setting device"
echo "⚙️ ARGS: "
echo "$@"
echo "ARGS len: $#"

ID=1
IP="localhost"
PORT=3000
PROTOCOL="http"

# Function to check if a string is a number
is_number() {
    re='^[0-9]+$'
    if ! [[ $1 =~ $re ]] ; then
        return 1
    else
        return 0
    fi
}

if [ $# -gt 0 ]; then
    if is_number "$1"; then
        ID=$1
    fi
    if [ $# -gt 1 ]; then
        IP=$2
        if [ $# -gt 2 ]; then
            PORT=$3
            if [ $# -gt 3 ]; then
                PROTOCOL=$4
            fi
        fi
    fi
fi

echo "id: $ID"
echo "ip: $IP"
echo "port: $PORT"
echo "protocol: $PROTOCOL"



wget -O config.yaml "$PROTOCOL://$IP:$PORT/config_yaml/$ID"
wget -O camera_list.json "$PROTOCOL://$IP:$PORT/camera_list_json/$ID"
wget -O 1_build_docker.sh "$PROTOCOL://$IP:$PORT/build_docker_sh/$ID"
wget -O 2_start_docker.sh "$PROTOCOL://$IP:$PORT/start_docker_sh/$ID"
wget -O dockerfile "$PROTOCOL://$IP:$PORT/dockerfile/$ID"
wget -O sql_data.sql "$PROTOCOL://$IP:$PORT/prepare_sql/$ID"

chmod +x *.sh