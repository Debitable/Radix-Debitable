use scrypto::prelude::*;

blueprint! {
    struct Bank {
        bank_account: Vault,
        cash: Vault,
    }

    impl Bank {
        pub fn instantiate_bank() -> ComponentAddress {
            let mut initial_cash = ResourceBuilder::new_fungible()
                .divisibility(DIVISIBILITY_MAXIMUM)
                .metadata("name", "AggieCoin")
                .metadata("symbol", "AC")
                .metadata("description", "The currency - AggieCoin")
                .initial_supply(1000);

            // Fill the bank account and the pocket
            Self {
                bank_account: Vault::with_bucket(initial_cash.take(dec!(500))),
                cash: Vault::with_bucket(initial_cash),
            }
            .instantiate()
            .globalize()
        }

        pub fn balances(&self) -> (Decimal, Decimal) {
            (self.bank_account.amount(), self.cash.amount())
        }

        pub fn bank_deposit(&mut self, exchange: Decimal) -> (Decimal, Decimal){
            assert!(exchange < self.cash.amount(),
            "You don't have that much of cash. Your current balance is {}", self.cash.amount());
            self.bank_account.put(self.cash.take(exchange));
            (self.bank_account.amount(), self.cash.amount())
        }
        
        pub fn bank_withdraw(&mut self, exchange: Decimal) -> (Decimal, Decimal) {
            assert!(exchange < self.cash.amount(),
            "You don't have that much of cash. Your current balance is {}", self.cash.amount());
            self.cash.put(self.bank_account.take(exchange));
            (self.bank_account.amount(), self.cash.amount())
        }
    }
}