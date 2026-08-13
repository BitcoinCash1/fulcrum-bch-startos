ARCHES ?= x86 arm riscv

# overrides to s9pk.mk must precede the include statement
include s9pk.mk

# Clone sibling packages needed for TypeScript resolution during npm install
../bitcoin-cash-daemon-startos:
	git clone --depth=1 https://github.com/BitcoinCash1/bitcoin-cash-daemon-startos.git $@

../bitcoin-cash-node-startos:
	git clone --depth=1 https://github.com/BitcoinCash1/bitcoin-cash-node-startos.git $@

../flowee-startos:
	git clone --depth=1 https://github.com/BitcoinCash1/flowee-the-hub-startos.git $@

../knuth-bch-startos:
	git clone --depth=1 https://github.com/BitcoinCash1/knuth-bch-startos.git $@

# git+https installs sibling .ts *inside* node_modules, and ncc/ts-loader will
# not compile those. file: links resolve to these checkouts instead. npm ci
# rejects file: packages with no version field; npm install does not.
node_modules: package.json | ../bitcoin-cash-daemon-startos ../bitcoin-cash-node-startos ../flowee-startos ../knuth-bch-startos
	npm install
	@for pkg in ../bitcoin-cash-daemon-startos ../bitcoin-cash-node-startos ../flowee-startos ../knuth-bch-startos; do \
		mkdir -p "$$pkg/node_modules"; \
		ln -sfn "$(abspath node_modules)/@start9labs" "$$pkg/node_modules/@start9labs"; \
	done
