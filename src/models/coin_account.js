export default class {
    constructor(account_id, ticker) {
        this.ticker = ticker
        this.account_id = account_id
        this.trade_history = []
        this.current_balance = 0
        this.current_balance_usd = 0
    }
}