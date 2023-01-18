all: compile 

compile:
	cd contract; cargo build --target wasm32-unknown-unknown --release

test: compile
	cd contract; cargo test

invoke: compile
	cd contract; soroban invoke --wasm target/wasm32-unknown-unknown/release/ifttt_project.wasm --id 1 --fn publish --arg rr
