#!/usr/bin/env bash
set -euo pipefail

min=1
max=100
target=$((RANDOM % max + min))
attempts=0

echo "Guess the number (${min}-${max}). Type 'q' to quit."

while true; do
  printf "Your guess: "

  if ! IFS= read -r guess; then
    echo
    echo "Goodbye!"
    exit 0
  fi

  guess="${guess#"${guess%%[![:space:]]*}"}"
  guess="${guess%"${guess##*[![:space:]]}"}"

  if [[ "$guess" == "q" || "$guess" == "quit" ]]; then
    echo "Goodbye!"
    exit 0
  fi

  if [[ ! "$guess" =~ ^[0-9]+$ ]]; then
    echo "Please enter a whole number (${min}-${max}), or 'q' to quit."
    continue
  fi

  if (( guess < min || guess > max )); then
    echo "Out of range. Pick a number between ${min} and ${max}."
    continue
  fi

  ((attempts++))

  if (( guess < target )); then
    echo "Too low."
  elif (( guess > target )); then
    echo "Too high."
  else
    echo "Correct! You got it in ${attempts} guess(es)."
    exit 0
  fi
done
