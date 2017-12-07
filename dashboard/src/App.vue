<template>
  <div id="app">
    <p>${{ balances }}</p>
    <p>${{ portfolio_value }}</p>
    <p>${{ portfolio_return }}</p>
    <p>{{ portfolio_return_pct }}%</p>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      balances: null,
      portfolio_investment: 7041.03, // TODO: get this from the user
      portfolio_value: 0.0,
      portfolio_return: 0.0,
      portfolio_return_pct: 0.0
    }
  },
  created () {
    this.getBalances()
  },
  methods: {
    getBalances () {
      var ctx = this
      fetch('http://localhost:8000/api/balances/')
      .then(
        function(response) {
          console.log(response)
          if (response.status !== 200) {
            console.log('Error: ' + response.status)
            return
          }
          response.json().then(function(data) {
            ctx.balances = data
            ctx.calcPortfolioValue()
            ctx.calcPortfolioReturn()
            // console.log(data)
          })
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :-S', err)
      })
    },
    calcPortfolioValue() {
      var totalValue = 0
      for (var item in this.balances) {
        for (var exchange in this.balances[item]) {
          if (this.balances[item].hasOwnProperty(exchange)) {
              for (var coin in this.balances[item][exchange]) {
                var coinName = Object.keys(this.balances[item][exchange][coin])[0]
                var coinValue = this.balances[item][exchange][coin][coinName]['usd_value']
                totalValue = totalValue + coinValue
              }
          }
        }
      }
      this.portfolio_value = totalValue
    },
    calcPortfolioReturn() {
      console.log(this.portfolio_investment)
      console.log(this.portfolio_value)
      this.portfolio_return = this.portfolio_value - this.portfolio_investment
      this.portfolio_return_pct = (this.portfolio_return / this.portfolio_investment) * 100.0
    }
  }
}
</script>
