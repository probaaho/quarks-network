#!/bin/bash

# List of servers
servers=("one.quarks.com" "two.quarks.com" "three.quarks.com")

# Command to run (provided as a parameter)
command="$1"

# PEM key file path
pem_key="pem/quarks-pk.pem"
user=shuhan

# Function to execute the command on each server in parallel
run_command_parallel() {
  local server="$1"
  ssh -o StrictHostKeyChecking=no -i "$pem_key" "$user@$server" "$command"
}

# Check if the command is provided
if [ -z "$command" ]; then
  echo "Please provide a command to execute."
  exit 1
fi

# Run the command on servers in parallel
for server in "${servers[@]}"; do
  run_command_parallel "$server" &
done
wait
