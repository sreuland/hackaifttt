all: compile 

compile:
	cd contract; cargo build --target wasm32-unknown-unknown --release; cd ..

test: compile
	cd contract; cargo test;

invoke: compile
	soroban invoke --wasm contract/target/wasm32-unknown-unknown/release/ifttt_project.wasm \
		--id 1 --fn publish \
		--arg "[\"publish-that\", \"\"]"

iterate: compile
	./iterate.sh soroban invoke --wasm contract/target/wasm32-unknown-unknown/release/ifttt_project.wasm --id 1 --fn publish --arg

