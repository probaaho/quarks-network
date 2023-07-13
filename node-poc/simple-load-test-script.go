package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os/exec"
	"sort"
	"sync"
	"time"
)

// Function to load test
func loadTestFunction(iteration int, wg *sync.WaitGroup, elapsedTimes chan<- time.Duration, command string) {
	defer wg.Done()

	fmt.Printf("Running iteration %d\n", iteration)

	// Perform the desired load testing logic or function here
	startTime := time.Now()

	// the load

	out, err := runCommand(command)
	fmt.Println(out)
	fmt.Println(err)

	//
	elapsedTime := time.Since(startTime)

	fmt.Printf("Iteration %d completed in %s\n", iteration, elapsedTime)
	elapsedTimes <- elapsedTime
}

func runCommand(command string) ([]byte, error) {
	cmd := exec.Command("bash", "-c", command)
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}
	return output, nil
}

// Function to read a string from a .txt file
func readStringFromFile(filename string) (string, error) {
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func main() {
	// Number of concurrent iterations
	concurrency := 10

	// WaitGroup to wait for all goroutines to complete
	var wg sync.WaitGroup
	wg.Add(concurrency)

	// Channel to collect elapsed times
	elapsedTimes := make(chan time.Duration, concurrency)

	fmt.Println("Starting load testing")

	filepath := "cmd.txt"

	// Read the string from the file
	command, err := readStringFromFile(filepath)
	if err != nil {
		log.Fatal(err)
	}

	// Run iterations in parallel
	for i := 1; i <= concurrency; i++ {
		go loadTestFunction(i, &wg, elapsedTimes, command)
	}

	// Wait for all iterations to complete
	wg.Wait()
	close(elapsedTimes)

	// Collect elapsed times from the channel
	var allTimes []time.Duration
	for t := range elapsedTimes {
		allTimes = append(allTimes, t)
	}

	// Calculate and print results
	fmt.Println("Load testing completed")
	fmt.Println("Elapsed times:", allTimes)

	// Calculate minimum time
	minTime := min(allTimes)
	fmt.Println("Minimum time:", minTime)

	// Calculate maximum time
	maxTime := max(allTimes)
	fmt.Println("Maximum time:", maxTime)

	// Calculate average time
	avgTime := average(allTimes)
	fmt.Println("Average time:", avgTime)

	// Calculate median time
	medianTime := median(allTimes)
	fmt.Println("Median time:", medianTime)
}

// Helper function to calculate the minimum time
func min(times []time.Duration) time.Duration {
	min := times[0]
	for _, t := range times {
		if t < min {
			min = t
		}
	}
	return min
}

// Helper function to calculate the maximum time
func max(times []time.Duration) time.Duration {
	max := times[0]
	for _, t := range times {
		if t > max {
			max = t
		}
	}
	return max
}

// Helper function to calculate the average time
func average(times []time.Duration) time.Duration {
	total := time.Duration(0)
	for _, t := range times {
		total += t
	}
	avg := total / time.Duration(len(times))
	return avg
}

// Helper function to calculate the median time
func median(times []time.Duration) time.Duration {
	sortedTimes := make([]time.Duration, len(times))
	copy(sortedTimes, times)
	sort.Slice(sortedTimes, func(i, j int) bool {
		return sortedTimes[i] < sortedTimes[j]
	})

	middle := len(sortedTimes) / 2
	if len(sortedTimes)%2 == 1 {
		return sortedTimes[middle]
	}
	return (sortedTimes[middle-1] + sortedTimes[middle]) / 2
}
