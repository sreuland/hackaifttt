all: compile 

compile:
	cd contract; cargo build --target wasm32-unknown-unknown --release; cd ..

test: compile
	cd contract; cargo test;

invoke-local: compile
	soroban invoke --wasm contract/target/wasm32-unknown-unknown/release/ifttt_project.wasm \
		--id 1 --fn publish \
		--arg [112,117,98,108,105,115,104,109,101]

iterate: compile
	./scripts/iterate-local.sh

fund:
	echo "funding account $$(cat pubkey)"
	curl "https://friendbot-futurenet.stellar.org/?addr=$$(cat pubkey)"

fund-standalone:
	echo "funding account $$(cat pubkey)"
	curl "http://localhost:8000/friendbot?addr=$$(cat pubkey)"

quickstart:
	docker run --rm -it \
		--platform linux/amd64 \
		-p 8000:8000 \
		--name stellar \
		stellar/quickstart:soroban-dev@sha256:c4429def497ed78ca99ae40c8e2522ec932081b4428df992900b5bc8d53bd642 \
		--futurenet \
		--enable-soroban-rpc

deploy-standalone:
	echo "this step requires a running quickstrat image. run make quickstart to start one."
	soroban deploy \
    	--wasm contract/target/wasm32-unknown-unknown/release/ifttt_project.wasm \
    	--secret-key $$(cat seckey) \
    	--rpc-url http://localhost:8000/soroban/rpc \
    	--network-passphrase 'Standalone Network ; February 2017' > contract-id.txt

deploy:
	echo "this step requires a running quickstrat image. run make quickstart to start one."
	soroban deploy \
    	--wasm contract/target/wasm32-unknown-unknown/release/ifttt_project.wasm \
    	--secret-key $$(cat seckey) \
    	--rpc-url http://localhost:8000/soroban/rpc \
    	--network-passphrase 'Test SDF Future Network ; October 2022' > contract-id.txt

invoke-standalone:
	./scripts/iterate-standalone.sh

invoke:
	./scripts/iterate.sh

run: compile test fund deploy invoke
	echo "done"

	
