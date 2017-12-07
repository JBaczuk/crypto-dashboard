<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col sm="6" lg="3">
        <b-card no-body class="bg-primary">
          <b-card-body class="pb-0">
            <!--<b-dropdown class="float-right" variant="transparent p-0" right>
              <template slot="button-content">
                <i class="icon-settings"></i>
              </template>
              <b-dropdown-item>Action</b-dropdown-item>
              <b-dropdown-item>Another action</b-dropdown-item>
              <b-dropdown-item>Something else here...</b-dropdown-item>
              <b-dropdown-item disabled>Disabled action</b-dropdown-item>
            </b-dropdown>-->
            <h2 class="mb-0">Crypto Portfolio</h2><br>
            <h4 class="mb-0">${{portfolio_value}}</h4>
            <p class="lead">{{ portfolio_return_pct }}%</p>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col sm="12" lg="6">
          <pie-chart :data="pie_chart_data" :donut="true" width="800px" height="500px"></pie-chart>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="12" lg="12">
        <!-- TradingView Widget BEGIN -->
        <!--<script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
          new TradingView.widget({
            "width": 980,
            "height": 610,
            "symbol": "NASDAQ:AAPL",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "Light",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "hideideas": true
          });
        </script>-->
        <!-- TradingView Widget END -->
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  data: function () {
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
          function (response) {
            console.log(response)
            if (response.status !== 200) {
              console.log('Error: ' + response.status)
              return
            }
            response.json().then(function (data) {
              ctx.balances = data
              ctx.calcPortfolioValue()
              ctx.calcPortfolioReturn()
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
      this.portfolio_return = this.portfolio_value - this.portfolio_investment
      this.portfolio_return_pct = ((this.portfolio_return / this.portfolio_investment) * 100.0).toFixed(2)
    },
    createPieChart () {
      var pieChartDataArray = []
      for (var item in this.balances) {
        for (var exchange in this.balances[item]) {
          if (this.balances[item].hasOwnProperty(exchange)) {
            for (var coin in this.balances[item][exchange]) {
              var coinName = Object.keys(this.balances[item][exchange][coin])[0]
              var coinValue = this.balances[item][exchange][coin][coinName]['usd_value']
              var coinPieSlice = ([coinName, coinValue])
              pieChartDataArray.push(coinPieSlice)
            }
          }
        }
      }
      this.pie_chart_data = pieChartDataArray
    }
  }
}
</script>
