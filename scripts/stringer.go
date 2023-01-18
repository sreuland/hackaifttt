package main

import (
	"fmt"
	"os"
)

func main() {
	arg := os.Args[1]
	out := "["
	for i := 0; i < len(arg); i++ {
		out = fmt.Sprintf("%s%d", out, arg[i])
		if i < len(arg)-1 {
			out += ","
		}
	}
	out += "]"
	fmt.Printf("%s", out)
}
