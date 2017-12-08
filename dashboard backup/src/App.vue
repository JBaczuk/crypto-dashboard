<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col"></div>
        <div class="col">
          <div class="jumbotron jumbotron-fluid">
            <div class="container">
              <h1 class="display-3">${{ portfolio_value }}</h1>
              <p class="lead">{{ portfolio_return_pct }}%</p>
            </div>
          </div>
        </div>
        <div class="col"></div>
      </div>
      <div class="row">
        <div class="col"></div>
        <div class="col">
          <pie-chart :data="pie_chart_data" :donut="true" width="800px" height="500px"></pie-chart>
        </div>
        <div class="col"></div>
      </div>
    </div>
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
      portfolio_return_pct: 0.0,
      pie_chart_data: []
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
            ctx.createPieChart()
            console.log("ctx.pie_chart_data " + ctx.pie_chart_data)
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
      this.portfolio_value = totalValue.toFixed(2)
    },
    calcPortfolioReturn() {
      this.portfolio_return = this.portfolio_value - this.portfolio_investment
      this.portfolio_return_pct = ((this.portfolio_return / this.portfolio_investment) * 100.0).toFixed(2)
    },
    createPieChart() {
      var pie_chart_data_array = []
      for (var item in this.balances) {
        for (var exchange in this.balances[item]) {
          if (this.balances[item].hasOwnProperty(exchange)) {
              for (var coin in this.balances[item][exchange]) {
                var coinName = Object.keys(this.balances[item][exchange][coin])[0]
                var coinValue = this.balances[item][exchange][coin][coinName]['usd_value']
                var portfolio_pct = coinValue / this.portfolio_value
                var coin_pie_slice = ([coinName, coinValue])
                pie_chart_data_array.push(coin_pie_slice)
              }
          }
        }
      }
      console.log("pie_chart_data_array " + pie_chart_data_array)
      this.pie_chart_data = pie_chart_data_array
    }
  }
}
</script>
