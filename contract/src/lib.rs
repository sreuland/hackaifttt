#![no_std]
use soroban_sdk::{contractimpl, symbol, vec, Env, Symbol, Vec};

const COUNTER: Symbol = symbol!("COUNTER");

pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn publish(env: Env, to: Vec<Symbol>) -> Vec<Symbol> {
        let mut count: u32 = env
            .storage()
            .get(COUNTER)
            .unwrap_or(Ok(0)) // If no value set, assume 0.
            .unwrap(); // Panic if the value of COUNTER is not u32.
        count += 1;
        env.storage().set(COUNTER, count);
        let mut out: soroban_sdk::Vec<Symbol> = vec![&env];
        out.append(&to.clone());
        env.events().publish((COUNTER, symbol!("poem")), to);
        out
    }
}

#[cfg(test)]
mod test {
    use super::{Contract, ContractClient};
    use soroban_sdk::{symbol, vec, Env};

    #[test]
    fn test() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Contract);
        let client = ContractClient::new(&env, &contract_id);

        let words = client.publish(&vec!(&env, symbol!("Dev")));
        assert_eq!(
            words,
            vec![&env, symbol!("Dev"),]
        );
    }
}
