#!/bin/bash

# List of servers with username and password
servers=(
  "one.quarks.com|user|user1234"
  "two.quarks.com|user|user1234"
  "three.quarks.com|user|user1234"
  "four.quarks.com|user|user1234"
)

# Command to run (provided as a parameter)
command="$@"

# Function to execute the command on each server
run_command() {
  IFS='|' read -r hostname username password <<< "$1"
  echo "Running command on $hostname:"
  echo "$2" | sshpass -p "$password" ssh -o StrictHostKeyChecking=no "$username@$hostname"
  echo "------------------------"
}

# Check if the command is provided
if [ -z "$command" ]; then
  echo "Please provide a command to execute."
  exit 1
fi

# Run the command on servers in parallel
export -f run_command
parallel -j 0 run_command ::: "${servers[@]}" ::: "$command"
