all: compile 

compile:
	cd contract; cargo build --target wasm32-unknown-unknown --release; cd ..

test: compile
	cd contract; cargo test;

invoke-local: compile
	soroban invoke --wasm contract/target/wasm32-unknown-unknown/release/ifttt_project.wasm \
		--id 1 --fn publish \
		--arg "[\"publish-that\", \"\"]"

iterate: compile
	./iterate-local.sh

fund:
	echo "funding account $$(cat pubkey)"
	curl "https://friendbot-futurenet.stellar.org/?addr=$$(cat pubkey)"

deploy:
	soroban deploy \
    	--wasm contract/target/wasm32-unknown-unknown/release/ifttt_project.wasm \
    	--secret-key $$(cat seckey) \
    	--rpc-url http://localhost:8000/soroban/rpc \
    	--network-passphrase 'Test SDF Future Network ; October 2022' > contract-id.txt

invoke:
	./iterate.sh

run: compile test fund deploy invoke
	echo "done"

	
