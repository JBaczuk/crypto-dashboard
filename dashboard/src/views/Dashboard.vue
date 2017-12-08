<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col sm="6" lg="3">
        <b-card no-body class="bg-primary">
          <b-card-body class="pb-0">
            <h2 class="mb-0">Crypto Portfolio</h2><br>
            <h4 class="mb-0">${{ portfolio_value }}</h4>
            <b-form-fieldset label="Initial Investment">
              <b-form-input type="text" id="init_inv" v-on:keyup.enter.native="calcPortfolioReturn" v-model="portfolio_investment"></b-form-input>
            </b-form-fieldset>
            <p class="lead">${{ portfolio_return }}</p>
            <p class="lead">{{ portfolio_return_pct }}%</p>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="12" lg="6">
        <b-card header="Portfolio Breakdown">
          <div class="chart-wrapper">
            <pie-chart :data="pie_chart_data" :donut="true"></pie-chart>
          </div>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      balances: null,
      portfolio_investment: 100.00, // TODO: get this from the user
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
          function (response) {
            if (response.status !== 200) {
              console.log('Error: ' + response.status)
              return
            }
            response.json().then(function (data) {
              ctx.balances = data
              ctx.calcPortfolioValue()
              ctx.createPieChart()
            })
          }
        )
        .catch(function (err) {
          console.log('Fetch Error :-S', err)
        })
    },
    calcPortfolioValue () {
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
    calcPortfolioReturn () {
      this.portfolio_return = (this.portfolio_value - this.portfolio_investment).toFixed(2)
      this.portfolio_return_pct = ((this.portfolio_return / this.portfolio_investment) * 100.0).toFixed(2)
      console.log(this.portfolio_return)
      console.log(this.portfolio_value)
    },
    createPieChart () {
      var pieChartDataArray = []
      for (var item in this.balances) {
        for (var exchange in this.balances[item]) {
          if (this.balances[item].hasOwnProperty(exchange)) {
            for (var coin in this.balances[item][exchange]) {
              var coinName = Object.keys(this.balances[item][exchange][coin])[0]
              var coinValue = this.balances[item][exchange][coin][coinName]['usd_value']
              var existingCoin = false
              pieChartDataArray.forEach(function (entry) {
                if (entry[0] === coinName) {
                  entry[1] = entry[1] + coinValue
                  existingCoin = true
                }
              })
              if (!existingCoin) {
                var coinPieSlice = [coinName, coinValue]
                pieChartDataArray.push(coinPieSlice)
                existingCoin = false
              }
            }
          }
        }
      }
      this.pie_chart_data = pieChartDataArray
    }
  }
}
</script>
