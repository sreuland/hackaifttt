#![no_std]
use soroban_sdk::{contractimpl, symbol, vec, Env, Symbol, Vec, Bytes};

const COUNTER: Symbol = symbol!("COUNTER");

pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn publish(env: Env, to: Bytes) -> Vec<Bytes> {
        let mut count: u32 = env
            .storage()
            .get(COUNTER)
            .unwrap_or(Ok(0)) // If no value set, assume 0.
            .unwrap(); // Panic if the value of COUNTER is not u32.
        count += 1;
        env.storage().set(COUNTER, count);
        let mut out: soroban_sdk::Vec<Bytes> = vec![&env];
        out.push_back(to.clone());
        env.events().publish((symbol!("ifttt_evt"), symbol!("gdoc")), to);
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
        let strparm = "Dev";
        let words = client.publish(&vec!(&env, Bytes(strparm.as_bytes())));
        assert_eq!(
            words,
            vec![&env, symbol!("Dev"),]
        );
    }
}
