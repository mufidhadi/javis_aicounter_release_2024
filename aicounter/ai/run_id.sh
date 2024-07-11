#!/bin/bash
echo "🚀 Bismillah, App is starting..."
echo "⚙️ ARGS: "
echo "$@"
# echo "$1"

# Function to check if a string is a number
is_number() {
    re='^[0-9]+$'
    if ! [[ $1 =~ $re ]] ; then
        return 1
    else
        return 0
    fi
}

# Check if an argument is given by the user
if [ $# -gt 0 ]; then
    # Check if the first argument is a number
    if is_number "$1"; then
        # If true, run python main.py -i $1

        # check the python version, if it is less than 3, run python3
        if [ "$(python -V 2>&1 | cut -d' ' -f 2 | cut -d. -f1)" -lt "3" ]; then
            python3 main.py -i $1
        else
            python main.py -i $1
        fi
        # python main.py -i $1
    else
        # If not a number, display an error message
        echo "Error: First argument must be a number."
        exit 1
    fi
else
    # Else, run python main.py
    python main.py
fi
